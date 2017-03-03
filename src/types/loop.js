const { uint } = require('./uint');

// Loop over a sub-struct
//
// struct: the structure that repeats
// repetitionsPrefixed: this loop is prefixed with a repetition count
// repetitionsPrefixLength: size of the prefix
// repetitionsBigEndian: override endianness of size prefix
// repetitions: how often the sub-struct repeats, defaults to Infinity
// repetitionsField: field in the parse tree that defines the repetition count
//
// returns: parser function that returns array of parsed items
function loop(name,
	{
		struct,
		repetitions = Infinity,
		repetitionsField,
		repetitionsPrefixed = false,
		repetitionsPrefixLength = 0,
		repetitionsBigEndian,
	}
) {
	function parse(buffer, parseTree, { bigEndian: inheritBigEndian }) {
		let offset = 0;

		if (repetitionsBigEndian === undefined) {
			repetitionsBigEndian = inheritBigEndian;
		}

		// determine how many repetitions we want
		if (repetitionsPrefixed) {
			const prefixParser = uint('prefix', {
				size: repetitionsPrefixLength,
				bigEndian: repetitionsBigEndian,
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
			for (const { parse: parseItem, name: itemName } of struct) {
				const slice = data.slice(parserOffset, data.length);
				const r = parseItem(slice, loopResult, { bigEndian: inheritBigEndian });

				loopResult[itemName] = r.value;
				parserOffset += r.size;
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
			value: result,
			size: offset,
		};
	}

	function prepareEncode(object, parseTree) {
		if (repetitions === Infinity) {
			repetitions = object.length;
		}

		if (repetitionsField) {
			parseTree[repetitionsField] = repetitions;
		}
	}

	function encode(object, { bigEndian }) {
		// TODO: encode loop
	}

	function makeStruct() {
		return [];
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// export everything
module.exports = loop;
