// Chunk parser, glorified case selector
//
// select: object for switch cases: match = value to match, struct = sub-struct to parse
// field: field to check for value
// sizeField: size field from parse tree
// sizeFieldTransfrom: transform function to modify the size field value before using it
// sizeFieldReverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns parsed sub-structure
function selector(name,
	{
		select,
		field,
		flatten = false,
		sizeField,
		sizeFieldTransform = value => value,
		sizeFieldReverseTransform = value => value,
	}
) {
	function parse(buffer, parseTree, { bigEndian: inheritBigEndian }) {
		let size = buffer.length;

		if (sizeField) {
			size = sizeFieldTransform(parseTree[sizeField]);
		}

		const data = buffer.slice(0, size);

		for (const { match, struct } of select) {
			let matched = false;

			if (match instanceof Buffer) {
				matched = (match.compare(parseTree[field]) === 0);
			} else {
				matched = (match === parseTree[field]);
			}

			if (matched) {
				// case found apply struct
				let offset = 0;
				let result = {};

				for (const { parse: parseItem, name: itemName } of struct) {
					const slice = data.slice(offset, data.length);
					const r = parseItem(slice, result, { bigEndian: inheritBigEndian });

					if ((struct.length === 1) && flatten) {
						result = r.value;
					} else {
						result[itemName] = r.value;
					}
					offset += r.size;
				}

				// return result
				return {
					value: result,
					size: offset,
				};
			}
		}

		// case not found return `null`
		return {
			value: null,
			size,
		};
	}

	function prepareEncode(object, parseTree) {
		// TODO: update size field
	}

	function encode(object, { bigEndian }) {
		// TODO: encode selector
	}

	function makeStruct() {
		return Buffer.alloc(0);
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// export everything
module.exports = selector;
