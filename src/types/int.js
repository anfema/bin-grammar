// Generic Signed Integer (two's complement)
//
// size: byte length
// bigEndian: override big endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns transformed signed integer
function int(name,
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

		// parse int from buffer, we could probably use the buffer functions
		// for this but this way we can do 24 bit values for example
		for (let i = 0; i < size; i += 1) {
			if (bigEndian) {
				value = (value << 8) + buffer[i];
			} else {
				value += buffer[i] << (8 * i);
			}
		}

		// two's complement (yeah magic)
		if (value & (0x80 << ((size - 1) * 8))) {
			let mask = 0;

			for (let i = 0; i < size; i += 1) {
				mask |= (0xff << (i * 8));
			}
			value = -((~value & mask) + 1);
		}

		return {
			value: transform(value),
			size,
		};
	}

	function prepareEncode(object, parseTree) {
	}

	function encode(object, { bigEndian }) {
		// TODO: encode int
	}

	function makeStruct() {
		return reverseTransform(0);
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// 8 Bit Signed Integer (two's complement)
//
// transform: value transformer function gets the parsed value as parameter, returns new value
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns transformed signed integer
function int8(name,	{ transform = value => value } = {}) {
	return int(name, { size: 1, transform });
}

// 16 Bit Signed Integer (two's complement)
//
// bigEndian: override big endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns transformed signed integer
function int16(name,
	{
		bigEndian,
		transform = value => value,
		reverseTransform = value => value,
	} = {}
) {
	return int(name, { size: 2, bigEndian, transform });
}

// 32 Bit Signed Integer (two's complement)
//
// bigEndian: override big endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns transformed signed integer
function int32(name,
	{
		bigEndian,
		transform = value => value,
		reverseTransform = value => value,
	} = {}
) {
	return int(name, { size: 4, bigEndian, transform });
}

// export everything
module.exports = {
	int,
	int8,
	int16,
	int32,
};
