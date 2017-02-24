// Generic Signed Integer (two's complement)
//
// size: byte length
// bigEndian: choose big endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns transformed signed integer
function Int(name,
	{
		size = 1,
		bigEndian = true,
		transform = value => value,
	} = {}
) {
	if ((size < 1) || (size > 4)) {
		throw new Error('Javascript bit operations are only safe to 32 bits, so we can\'t do sizes over that');
	}

	return function (buffer) {
		let value = 0;

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
			name,
			value: transform(value),
			size,
		};
	};
}

// 8 Bit Signed Integer (two's complement)
//
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns transformed signed integer
function Int8(name,	{ transform = value => value } = {}) {
	return Int(name, { size: 1, transform });
}

// 16 Bit Signed Integer (two's complement)
//
// bigEndian: choose big endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns transformed signed integer
function Int16(name,
	{
		bigEndian = true,
		transform = value => value,
	} = {}
) {
	return Int(name, { size: 2, bigEndian, transform });
}

// 32 Bit Signed Integer (two's complement)
//
// bigEndian: choose big endian encoding, else little endian encoded
// transform: value transformer function gets the parsed value as parameter, returns new value
//
// returns: parser function that returns transformed signed integer
function Int32(name,
	{
		bigEndian = true,
		transform = value => value,
	} = {}
) {
	return Int(name, { size: 4, bigEndian, transform });
}

// export everything
module.exports = {
	Int,
	Int8,
	Int16,
	Int32,
};
