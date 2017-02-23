// IEEE Float, generic float parser, defaults to single precision
//
// size: byte length, defaults to 4 (the IEEE single precision float length)
// bigEndian: set endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns a float
function Float(name,
	{
		size = 4,
		bigEndian = true,
		transform = (value) => value
	} = {}
) {
	if ((size !== 4) && (size !== 8)) {
		throw new Error('IEEE Floats are either 32 bits or 64 bits long');
	}

	return function(buffer) {
		let value = 0;

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
			name,
			value: transform(value),
			size,
		};
	};
}

// IEEE Double, specialized double precision parser
//
// bigEndian: set endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns a double
function Double(name,
	{
		bigEndian = true,
		transform = (value) => value
	} = {}
) {
	return Float(name, { size: 8, bigEndian, transform });
}

// export everything
module.exports = {
	Float,
	Double,
};
