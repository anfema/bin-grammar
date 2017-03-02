// IEEE Float, generic float parser, defaults to single precision
//
// size: byte length, defaults to 4 (the IEEE single precision float length)
// bigEndian: override endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns a float
function float(name,
	{
		size = 4,
		bigEndian,
		transform = value => value,
		reverseTransform = value => value,
	} = {}
) {
	if ((size !== 4) && (size !== 8)) {
		throw new Error('IEEE Floats are either 32 bits or 64 bits long');
	}

	function parse(buffer, parseTree, { bigEndian: inheritBigEndian }) {
		let value = 0;

		if (bigEndian === undefined) {
			bigEndian = inheritBigEndian;
		}

		// we use the default reader functions of node for this
		if (bigEndian) {
			if (size === 4) {
				value = buffer.readFloatBE();
			} else {
				value = buffer.readDoubleBE();
			}
		} else {
			if (size === 4) {
				value = buffer.readFloatLE();
			} else {
				value = buffer.readDoubleLE();
			}
		}

		return {
			value: transform(value),
			size,
		};
	}

	function prepareEncode(object, parseTree) {
	}

	function encode(object, { bigEndian }) {
		// TODO: encode float
	}

	function makeStruct() {
		return 0.0;
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// IEEE Double, specialized double precision parser
//
// bigEndian: set endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns a double
function double(name,
	{
		bigEndian,
		transform = value => value,
		reverseTransform = value => value,
	} = {}
) {
	return float(name, { size: 8, bigEndian, transform, reverseTransform });
}

// export everything
module.exports = {
	float,
	double,
};
