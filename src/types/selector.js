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

	function prepareEncode(object, parseTree, { bigEndian }) {

		// To update size field we have to actually encode the object
		// because size is probably dynamic
		for (const { match, struct } of select) {
			let matched = false;

			if (match instanceof Buffer) {
				matched = (match.compare(parseTree[field]) === 0);
			} else {
				matched = (match === parseTree[field]);
			}

			if (matched) {
				// case found apply struct
				let result = Buffer.alloc(0);

				// if the tree was flattened, reverse it here
				if ((flatten) && (struct.length === 1)) {
					const { prepareEncode: itemPrepareEncode, encode: encodeItem } = struct[0];

					itemPrepareEncode(object, {}, { bigEndian });
					const r = encodeItem(object, { bigEndian });

					// to avoid encoding the whole thing again, save the result
					// into the object
					parseTree[`${name}`] = r;
					if (sizeField) {
						parseTree[sizeField] = sizeFieldReverseTransform(r.length);
					}

					return;
				}

				for (const { name: itemName, prepareEncode: itemPrepareEncode } of struct) {
					const data = object[itemName];

					itemPrepareEncode(data, object, { bigEndian });
				}

				for (const { encode: encodeItem, name: itemName } of struct) {
					const data = object[itemName];
					const r = encodeItem(data, { bigEndian });

					result = Buffer.concat([result, r]);
				}

				// to avoid encoding the whole thing again, save the result
				// into the object
				parseTree[`${name}`] = result;
				if (sizeField) {
					parseTree[sizeField] = sizeFieldReverseTransform(result.length);
				}

				return;
			}
		}
		parseTree[sizeField] = sizeFieldReverseTransform(0);
		parseTree[`${name}`] = undefined;
	}

	function encode(object, { bigEndian }) {
		// fetch encoded content
		const result = object || Buffer.alloc(0);

		// return the cached result
		return result;
	}

	function makeStruct(parseTree, item) {
		let result = {};

		if (item !== undefined) {
			for (const { match, struct } of select) {
				let matched = false;

				if (match instanceof Buffer) {
					matched = (match.compare(parseTree[field]) === 0);
				} else {
					matched = (match === parseTree[field]);
				}

				if (matched) {
					if ((struct.length === 1) && (flatten)) {
						result = struct[0].makeStruct(parseTree);
					} else {
						for (const { name: partName, makeStruct: makePartStruct } of struct) {
							result[partName] = makePartStruct(result); // FIXME: what about nested structs
						}
					}
				}
			}
			parseTree[field] = item;
		} else {
			parseTree[field] = null;
		}

		return result;
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// export everything
module.exports = selector;
