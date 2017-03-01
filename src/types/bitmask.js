// Bitmask
//
// size: byte length
// bitfield: Object, key: flag name, value: bit number
//
// returns: parser function that returns array of set keys
function Bitmask(name,
	{
		size = 1,
		bitfield,
	}
) {
	if ((size < 1) || (size > 4)) {
		throw new Error('Javascript bit operations are only safe to 32 bits, so we can\'t do sizes over that');
	}

	return function (buffer, parseTree, { bigEndian }) {
		const result = [];
		let value = 0;

		// build value
		for (let i = 0; i < size; i += 1) {
			value = (value << 8) + buffer[i];
		}

		// determine which bits have been set
		for (let key of Object.keys(bitfield)) {
			const val = bitfield[key];

			if (value & 1 << (size * 8 - val - 1)) {
				result.push(key);
			}
		}

		// return result
		return {
			name,
			value: result,
			size,
		};
	};
}

// export everything
module.exports = Bitmask;
