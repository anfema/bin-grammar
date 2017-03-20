// Enumeration of possible values
//
// size: byte length
// choices: Object, key: choice name, value: value to check for
// bigEndian: override big endian encoding, else little endian encoded
//
// returns: parser function that returns key of choice or `null` if not in the enum
function enumeration(name,
	{
		size = 1,
		choices,
		bigEndian,
	}
) {
	if ((size < 1) || (size > 4)) {
		throw new Error('Javascript bit operations are only safe to 32 bits, so we can\'t do sizes over that');
	}

	function parse(buffer, parseTree, { bigEndian: inheritBigEndian }) {
		let value = 0;

		if (bigEndian === undefined) {
			bigEndian = inheritBigEndian;
		}

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
			value: null,
			size,
		};
	}

	function prepareEncode(object, parseTree, { bigEndian }) {
	}

	function encode(object, { bigEndian: inheritBigEndian }) {
		const value = choices[object];
		const data = Buffer.alloc(size);

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
		return null;
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// export everything
module.exports = enumeration;
