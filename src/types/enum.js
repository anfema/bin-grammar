// Enumeration of possible values
//
// size: byte length
// choices: Object, key: choice name, value: value to check for
// bigEndian: choose big endian encoding, else little endian encoded
//
// returns: parser function that returns key of choice or `null` if not in the enum
function Enum(name,
	{
		size = 1,
		choices,
		bigEndian = true,
	}
) {
	if ((size < 1) || (size > 4)) {
		throw new Error('Javascript bit operations are only safe to 32 bits, so we can\'t do sizes over that');
	}

	return function (buffer) {
		let value = 0;

		// parse value
		for (let i = 0; i < size; i += 1) {
			if (bigEndian) {
				value = (value << 8) + buffer[i];
			} else {
				value += buffer[i] << (8 * i);
			}
		}

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

		// no case matches, return `null`
		return {
			name,
			value: null,
			size,
		};
	};
}

// export everything
module.exports = Enum;
