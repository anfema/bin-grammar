const { uint } = require('./uint');

// Loop over a sub-struct
//
// Each iteration of the loop accesses its own context, which is initially
// empty apart from '_index', '_repetitions' and '_context'.
//
// struct: the structure that repeats
// repetitionsPrefixed: this loop is prefixed with a repetition count
// repetitionsPrefixLength: size of the prefix
// repetitionsBigEndian: override endianness of size prefix
// repetitions: how often the sub-struct repeats, defaults to Infinity
// repetitionsField: field in the parse tree that defines the repetition count
// contextField: field in the parse tree that is passed to each loop iteration
//               as '_context', along with '_index' and '_repetitions'.
// contextFieldTransform: passed two params, an object from the loop state
//               and the current loop index
// contextFieldReverseTransform: passed two params, an object from the loop state
//               and the current loop index
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
		contextField,
		contextFieldTransform = (value, idx) => value,
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
			}).parse;
			const result = prefixParser(buffer, {}, { bigEndian: inheritBigEndian });

			repetitions = result.value;
			offset = result.size;
		}
		if (repetitionsField) {
			repetitions = parseTree[repetitionsField];
		}

		// run the loop for the defined sub-struct
		const result = [];
		const ctx = parseTree[contextField];

		for (let i = 0; i < repetitions; i += 1) {
			const data = buffer.slice(offset, buffer.length);
			const loopResult = {
				'_index': i,
				'_repetitions': repetitions,
				'_context' : contextFieldTransform(ctx, i),
			};
			let parserOffset = 0;

			// loop over items in the sub struct
			for (const { parse: parseItem, name: itemName } of struct) {
				const slice = data.slice(parserOffset, data.length);
				const r = parseItem(slice, loopResult, { bigEndian: inheritBigEndian });

				loopResult[itemName] = r.value;
				parserOffset += r.size;
			}

			delete loopResult['_index'];
			delete loopResult['_repetitions'];
			delete loopResult['_context'];

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

	function prepareEncode(object, parseTree, { bigEndian }) {
		if (repetitions === Infinity) {
			repetitions = object.length;
		}

		if (repetitionsField) {
			parseTree[repetitionsField] = repetitions;
		}

		if(contextField) {
			object['_context'] = parseTree[contextField];
		}
	}

	function encode(object, { bigEndian }) {
		const parts = [];

		if (repetitionsPrefixed) {
			const prefixEncoder = uint('prefix', {
				size: repetitionsPrefixLength,
				bigEndian: repetitionsBigEndian,
			}).encode;
			const result = prefixEncoder(object.length, { bigEndian });

			parts.push(result);
		}

		let i = 0;

		for (const loopObject of object) {
			loopObject['_index'] = i;
			loopObject['_repetitions'] = repetitions;
			loopObject['_context'] = contextFieldTransform(object['_context'], i);

			for (const { prepareEncode: itemPrepareEncode, name: itemName } of struct) {
				const data = loopObject[itemName];

				itemPrepareEncode(data, loopObject, { bigEndian });
			}

			for (const { encode: encodeItem, name: itemName } of struct) {
				const data = loopObject[itemName];
				const result = encodeItem(data, { bigEndian });

				parts.push(result);
			}
			i += 1;
		}

		return Buffer.concat(parts);
	}

	function makeStruct(parseTree, items) {
		const result = [];

		if (items !== undefined) {
			for (const item of items) {
				const obj = {};

				for (const { makeStruct: makeItemStruct, name: itemName } of struct) {
					obj[itemName] = makeItemStruct(obj, item);
				}
				result.push(obj);
			}
		}

		return result;
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// export everything
module.exports = loop;
