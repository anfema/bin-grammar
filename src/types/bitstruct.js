const { UInt } = require('./uint');

// Destructured bytes
//
// When using this all sizes will be measured in bits instead of bytes
//
// size: byte length of this bit struct
// sizeField: size field from the parse tree
// sizeFieldTransform: transform function to apply before using the value of `sizeField`
// elements: array of sub elements, only `Bit` elements allowed
//
// returns: parser function that returns an object with the destructured bits
function BitStruct(name, { size = 1, sizeField, sizeFieldTransform = (value) => value, elements }) {
	return function (buffer, parseTree) {
		if (sizeField) {
			size = sizeFieldTransform(parseTree[sizeField]);
		}

		const parser = UInt('parser', { size });
		const parsed = parser(buffer.slice(0, size));
		const data = parsed.value;

		let offset = 0;
		const result = {};

		for (item of elements) {
			const r = item(data, (size * 8) - offset);

			result[r.name] = r.value;
			offset += r.size;
		}

		return {
			name,
			value: result,
			size,
		};
	};
}

// One bit flag
//
// name: name of the field
//
// returns: parser function that returns a bool
function BitFlag(name) {
	return function (data, offset) {
		const result = ((data & (1 << (offset - 1))) !== 0);

		return {
			name,
			value: result,
			size: 1,
		};
	};
}

// Sub-byte sized signed integer
//
// name: name of the field
// size: bit length of the integer
// transform: value transformer function
//
// returns: parser function that returns a signed integer
function BitInt(name, { size = 2, transform = (value) => value }) {
	return function (data, offset) {
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
			name,
			value: transform(result),
			size,
		};
	};
}

// Sub-byte sized unsigned integer
//
// name: name of the field
// size: bit length of the integer
// transform: value transformer function
//
// returns: parser function that returns a unsigned integer
function BitUInt(name, { size = 2, transform = (value) => value }) {
	return function (data, offset) {
		let mask = 0;

		for (let i = 0; i < size; i += 1) {
			mask = (mask << 1) | 0x01;
		}

		const result = (data >> (offset - size)) & mask;

		return {
			name,
			value: transform(result),
			size,
		};
	};
}

// Sub-byte sized enum
//
// name: name of the field
// size: bit length of the integer
// choices: object, key = name of the enum item, value = value to check for
//
// returns: parser function that returns a string of the matching enum case or `null`
function BitEnum(name, { size = 2, choices }) {
	return function (data, offset) {
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
			name,
			value: null,
			size,
		};
	};
}

// Sub-byte sized bitmask
//
// name: name of the field
// size: bit length of the integer
// bitfield: object, key = name of the bit, value = bit number
//
// returns: parser function that returns an array of strings of set bits
function BitBitMask(name, { size = 2, bitfield }) {
	return function (data, offset) {
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
			name,
			value: result,
			size,
		};
	};
}

// export everything
module.exports = {
	BitStruct,
	BitFlag,
	BitInt,
	BitUInt,
	BitEnum,
	BitBitMask,
};
