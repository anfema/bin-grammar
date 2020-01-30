const { uint } = require('./uint');

// Destructured bytes
//
// When using this all sizes will be measured in bits instead of bytes
//
// size: byte length of this bit struct
// sizeField: size field from the parse tree
// sizeFieldTransform: transform function to apply before using the value of `sizeField`
// sizeFieldReverseTransform: reverse of the transform function for encoding
// elements: array of sub elements, only `Bit` elements allowed
//
// returns: parser function that returns an object with the destructured bits

// FIXME: not entirely clear what happens if the container contains more data than the size
function bitStruct(name, {
	size = 1,
	sizeField,
	sizeFieldTransform = value => value,
	sizeFieldReverseTransform = value => value,
	elements,
}) {
	function parse(buffer, parseTree, { bigEndian }) {
		if (sizeField) {
			size = sizeFieldTransform(parseTree[sizeField]);
		}

		const parser = uint('parser', { size }).parse;
		const parsed = parser(buffer.slice(0, size), {}, { bigEndian });
		const data = parsed.value;

		let offset = 0;
		const result = {};

		for (const { parse: parseItem, name: itemName } of elements) {
			const r = parseItem(data, (size * 8) - offset);

			result[itemName] = r.value;
			offset += r.size;
		}

		return {
			value: result,
			size,
		};
	}

	function prepareEncode(object, parseTree, { bigEndian }) {
		if (sizeField) {
			parseTree[sizeField] = sizeFieldReverseTransform(size);
		}
	}

	function encode(object, { bigEndian }) {
		const result = Buffer.alloc(size);

		let offset = 0;
		let accum = 0;

		for (const { encode: encodeItem, name: itemName } of elements) {
			const r = encodeItem(object[itemName], (size * 8) - offset);

			accum |= r.value;
			offset += r.size;
		}

		// serialize
		for (let i = 0; i < size; i += 1) {
			if (bigEndian) {
				result[i] = (accum >> ((size - i - 1) * 8)) & 0xff;
			} else {
				result[i] = (accum >> (i * 8)) & 0xff;
			}
		}

		return result;
	}

	function makeStruct() {
		const result = {};

		for (const { makeStruct: makeStructItem, name: itemName } of elements) {
			result[itemName] = makeStructItem();
		}

		return result;
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// One bit flag
//
// name: name of the field
//
// returns: parser function that returns a bool
function bitFlag(name) {
	function parse(data, offset) {
		const result = ((data & (1 << (offset - 1))) !== 0);

		return {
			value: result,
			size: 1,
		};
	}

	function encode(object, offset) {
		let value;

		if (object) {
			value = (1 << (offset - 1));
		} else {
			value = 0;
		}

		return {
			value,
			size: 1,
		};
	}

	function makeStruct() {
		return false;
	}

	return { parse, encode, makeStruct, name };
}

// Sub-byte sized signed integer
//
// name: name of the field
// size: bit length of the integer
// transform: value transformer function
//
// returns: parser function that returns a signed integer
function bitInt(name, {
	size = 2,
	transform = value => value,
	reverseTransform = value => value,
}) {
	function parse(data, offset) {
		let mask = 0;

		for (let i = 0; i < size; i += 1) {
			mask = (mask << 1) | 0x01;
		}

		let result = (data >> (offset - size)) & mask;

		// two's complement (yeah magic)
		if (result & (1 << (size - 1))) {
			result = -((~result & mask) + 1);
		}

		return {
			value: transform(result),
			size,
		};
	}

	function encode(object, offset) {
		let value = reverseTransform(object);
		let mask = 0;

		for (let i = 0; i < size; i += 1) {
			mask = (mask << 1) | 0x01;
		}

		// two's complement (yeah magic)
		if (value < 0) {
			value = -((~value & mask) + 1);
		}

		return {
			value: ((value & mask) << (offset - size)),
			size,
		};
	}

	function makeStruct() {
		return 0;
	}

	return { parse, encode, makeStruct, name };
}

// Sub-byte sized unsigned integer
//
// name: name of the field
// size: bit length of the integer
// transform: value transformer function
//
// returns: parser function that returns a unsigned integer
function bitUInt(name, {
	size = 2,
	transform = value => value,
	reverseTransform = value => value,
}) {
	function parse(data, offset) {
		let mask = 0;

		for (let i = 0; i < size; i += 1) {
			mask = (mask << 1) | 0x01;
		}

		const result = (data >> (offset - size)) & mask;

		return {
			value: transform(result),
			size,
		};
	}

	function encode(object, offset) {
		let mask = 0;

		for (let i = 0; i < size; i += 1) {
			mask = (mask << 1) | 0x01;
		}

		return {
			value: ((reverseTransform(object) & mask) << (offset - size)),
			size,
		};
	}

	function makeStruct() {
		return 0;
	}

	return { parse, encode, makeStruct, name };
}

// Sub-byte sized enum
//
// name: name of the field
// size: bit length of the integer
// choices: object, key = name of the enum item, value = value to check for
//
// returns: parser function that returns a string of the matching enum case or `null`
function bitEnum(name, { size = 2, choices }) {
	function parse(data, offset) {
		let mask = 0;

		for (let i = 0; i < size; i += 1) {
			mask = (mask << 1) | 0x01;
		}

		const value = (data >> (offset - size)) & mask;

		// check which enum case matches
		for (const key of Object.keys(choices)) {
			const val = choices[key];

			if (value === val) {
				return {
					name,
					value: key,
					size,
				};
			}
		}

		return {
			value: null,
			size,
		};
	}

	function encode(object, offset) {
		const value = choices[object];

		return {
			value: (value << (offset - size)),
			size,
		};
	}

	function makeStruct() {
		return 0;
	}

	return { parse, encode, makeStruct, name };
}

// Sub-byte sized bitmask
//
// name: name of the field
// size: bit length of the integer
// bitfield: object, key = name of the bit, value = bit number
//
// returns: parser function that returns an array of strings of set bits
function bitBitMask(name, { size = 2, bitfield }) {
	function parse(data, offset) {
		const result = [];
		let mask = 0;

		for (let i = 0; i < size; i += 1) {
			mask = (mask << 1) | 0x01;
		}

		const value = (data >> (offset - size)) & mask;

		// determine which bits have been set
		for (const key of Object.keys(bitfield)) {
			const val = bitfield[key];

			if (value & 1 << (size - val - 1)) {
				result.push(key);
			}
		}

		return {
			value: result,
			size,
		};
	}

	function encode(object, offset) {
		let value = 0;

		for (const item of object) {
			const bit = bitfield[item];

			value |= (1 << (size - bit - 1));
		}

		return {
			value: (value << (offset - size)),
			size,
		};
	}

	function makeStruct() {
		return [];
	}

	return { parse, encode, makeStruct, name };
}

// export everything
module.exports = {
	bitStruct,
	bitFlag,
	bitInt,
	bitUInt,
	bitEnum,
	bitBitMask,
};
