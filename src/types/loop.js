// Loop over a sub-struct
//
// struct: the structure that repeats
// repetitionsPrefixed: this loop is prefixed with a repetition count
// repetitionsPrefixLength: size of the prefix
// repetitionsBigEndian: endianness of size prefix
// repetitions: how often the sub-struct repeats, defaults to Infinity
// repetitionsField: field in the parse tree that defines the repetition count
//
// returns: parser function that returns array of parsed items
function Loop(name,
	{
		struct,
		repetitions = Infinity,
		repetitionsField,
		repetitionsPrefixed = false,
		repetitionsPrefixLength = 0,
		repetitionsBigEndian = true
	}
) {
	return function(buffer, parseTree) {
		let offset = 0;

		// determine how many repetitions we want
		if (repetitionsPrefixed) {
			const prefixParser = UInt('prefix', {
				size: repetitionsPrefixLength,
				bigEndian: repetitionsBigEndian
			});
			const result = prefixParser(buffer);

			repetitions = result.value;
			offset = result.size;
		}
		if (repetitionsField) {
			repetitions = parseTree[repetitionsField];
		}

		// run the loop for the defined sub-struct
		const result = [];

		for (let i = 0; i < repetitions; i += 1) {
			const data = buffer.slice(offset, buffer.length);
			const loopResult = {};
			let parserOffset = 0;

			// loop over items in the sub struct
			for (item of struct) {
				const slice = data.slice(parserOffset, data.length);

				const { name: itemName, value, size } = item(slice, loopResult);
				loopResult[itemName] = value;
				parserOffset += size;
			}

			result.push(loopResult);
			offset += parserOffset;

			// if we are out of bounds stop parsing even if repetition count was not reached
			if (offset >= buffer.length) {
				break;
			}
		}

		// return result array
		return {
			name,
			value: result,
			size: offset,
		};
	};
}

// export everything
module.exports = Loop;
