// Generic Unsigned Integer
//
// size: byte length
// bigEndian: override big endian encoding
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns a transformed unsigned integer
function UInt(name,
	{
		size = 1,
		bigEndian,
		transform = value => value,
	} = {}
) {
	if ((size < 1) || (size > 4)) {
		throw new Error('Javascript bit operations are only safe to 32 bits, so we can\'t do sizes over that');
	}

	return function (buffer, parseTree, { bigEndian: inheritBigEndian }) {
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
			name,
			value: transform(value),
			size,
		};
	};
}

// 8 Bit Unsigned Integer
//
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns a transformed unsigned integer
function UInt8(name, { transform = value => value } = {}) {
	return UInt(name, { size: 1, transform });
}

// 16 Bit Unsigned Integer
//
// bigEndian: override big endian encoding
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns a transformed unsigned integer
function UInt16(name, { bigEndian, transform = value => value } = {}) {
	return UInt(name, { size: 2, bigEndian, transform });
}

// 32 Bit Unsigned Integer
//
// bigEndian: override big endian encoding
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns a transformed unsigned integer
function UInt32(name, { bigEndian, transform = value => value } = {}) {
	return UInt(name, { size: 4, bigEndian, transform });
}

// export everything
module.exports = {
	UInt,
	UInt8,
	UInt16,
	UInt32,
};
