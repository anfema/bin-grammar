// Chunk parser, glorified case selector
//
// select: list of case tuples, 1st item: value to match, 2nd item: sub-structure to use
// field: field to check for value
//
// returns: parser function that returns parsed sub-structure

function Selector(name, { select, field, sizeField }) {
	let parser = function(buffer, parseTree) {
		let size = buffer.length;
		if (sizeField) {
			size = parseTree[sizeField];
		}

		const data = buffer.slice(0, size);

		for (const { match, struct } of select) {
			// TODO: buffers are compared by calling `.compare`

			if (match === parseTree[field]) {
				// case found apply struct
				let offset = 0;
				const result = {};

				for (item of struct) {
					const slice = data.slice(offset, data.length);

					const { name: itemName, value, size: itemSize } = item(slice, result);
					result[itemName] = value;
					offset += itemSize;
				}

				// return result
				return {
					name,
					value: result,
					size: offset,
				}
			}
		}

		// case not found return `null`
		return {
			name,
			value: null,
			size,
		};
	}

	return parser;
}

module.exports = Selector;
