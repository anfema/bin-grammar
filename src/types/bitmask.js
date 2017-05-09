// Bitmask
//
// size: byte length
// bitfield: Object, key: flag name, value: bit number
//
// returns: parser function that returns array of set keys
function bitmask(name,
	{
		size = 1,
		bitfield,
	}
) {
	if ((size < 1) || (size > 4)) {
		throw new Error('Javascript bit operations are only safe to 32 bits, so we can\'t do sizes over that');
	}

	function parse(buffer, parseTree, { bigEndian }) {
		const result = [];
		let value = 0;

		// build value
		for (let i = 0; i < size; i += 1) {
			value = (value << 8) + buffer[i];
		}

		// determine which bits have been set
		for (const key of Object.keys(bitfield)) {
			const val = bitfield[key];

			if (value & 1 << (size * 8 - val - 1)) {
				result.push(key);
			}
		}

		// return result
		return {
			value: result,
			size,
		};
	}

	function prepareEncode(object, parseTree, { bigEndian }) {
	}

	function encode(object, { bigEndian }) {
		let value = 0;

		for (const key of object) {
			const bit = bitfield[key];

			value |= (1 << (size * 8 - bit - 1));
		}

		const result = Buffer.alloc(size);

		for (let i = 0; i < size; i += 1) {
			result[i] = (value >> (i * 8)) & 0xff;
		}

		return result;
	}

	function makeStruct() {
		return [];
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// export everything
module.exports = bitmask;
