// Chunk parser, glorified case selector
//
// select: object for switch cases: match = value to match, struct = sub-struct to parse
// field: field to check for value
// sizeField: size field from parse tree
// sizeFieldTransfrom: transform function to modify the size field value before using it
//
// returns: parser function that returns parsed sub-structure
function Selector(name,
	{
		select,
		field,
		flatten = false,
		sizeField,
		sizeFieldTransform = (value) => value,
	}
) {
	return function (buffer, parseTree) {
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

				for (const item of struct) {
					const slice = data.slice(offset, data.length);
					const r = item(slice, result);

					if ((struct.length === 1) && flatten) {
						result = r.value;
					} else {
						result[r.name] = r.value;
					}
					offset += r.size;
				}

				// return result
				return {
					name,
					value: result,
					size: offset,
				};
			}
		}

		// case not found return `null`
		return {
			name,
			value: null,
			size,
		};
	};
}

// export everything
module.exports = Selector;
