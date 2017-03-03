// Generic Unsigned Integer
//
// size: byte length
// bigEndian: override big endian encoding
// transform: value transformer function gets the parsed value as parameter, returns new value
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns a transformed unsigned integer
function uint(name,
	{
		size = 1,
		bigEndian,
		transform = value => value,
		reverseTransform = value => value,
	} = {}
) {
	if ((size < 1) || (size > 4)) {
		throw new Error('Javascript bit operations are only safe to 32 bits, so we can\'t do sizes over that');
	}

	function parse(buffer, parseTree, { bigEndian: inheritBigEndian }) {
		let value = 0;

		if (bigEndian === undefined) {
			bigEndian = inheritBigEndian;
		}

		for (let i = 0; i < size; i += 1) {
			if (bigEndian) {
				value = (value << 8) + buffer[i];
			} else {
				value += buffer[i] << (8 * i);
			}
		}

		return {
			value: transform(value),
			size,
		};
	};

	function prepareEncode(object, parseTree, { bigEndian }) { }

	function encode(object, { bigEndian: inheritBigEndian }) {
		const data = Buffer.alloc(size);
		const value = reverseTransform(object);

		if (bigEndian === undefined) {
			bigEndian = inheritBigEndian;
		}

		for (let i = 0; i < size; i += 1) {
			if (bigEndian) {
				data[i] = (value >> ((size - i - 1) * 8)) & 0xff;
			} else {
				data[i] = (value >> (i * 8)) & 0xff;
			}
		}

		return data;
	}

	function makeStruct() {
		return reverseTransform(0);
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// 8 Bit Unsigned Integer
//
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns a transformed unsigned integer
function uint8(name, { transform = value => value } = {}) {
	return uint(name, { size: 1, transform });
}

// 16 Bit Unsigned Integer
//
// bigEndian: override big endian encoding
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns a transformed unsigned integer
function uint16(name, { bigEndian, transform = value => value } = {}) {
	return uint(name, { size: 2, bigEndian, transform });
}

// 32 Bit Unsigned Integer
//
// bigEndian: override big endian encoding
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns a transformed unsigned integer
function uint32(name, { bigEndian, transform = value => value } = {}) {
	return uint(name, { size: 4, bigEndian, transform });
}

// export everything
module.exports = {
	uint,
	uint8,
	uint16,
	uint32,
};
