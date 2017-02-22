const { UInt } = require('./uint');

// Binary data
//
// size: byte length or 0 if variable length
// sizePrefixed: if set it is assumed that the data is prefixed with it's length
// sizeField: if set use this field name from the parse tree for the size of this data item
// sizePrefixLength: length of the size prefix
// bigEndian: set big endian encoding for the size prefix
//
// returns: parser function that returns buffer
function Binary(name, {size, sizeField, sizePrefixed = false, sizePrefixLength = 0, bigEndian = true} = {}) {
	let parser = function(buffer, parseTree) {
		let offset = 0;

		// determine size to copy to result buffer
		if (sizePrefixed) {
			const prefixParser = UInt('prefix', { size: sizePrefixLength, bigEndian })
			const result = prefixParser(buffer);
			size = result.value;
			offset = result.size;
		}
		if (sizeField) {
			size = parseTree[sizeField];
		}
		if (size === undefined) {
			size = buffer.length;
		}

		// just copy data to result
		const result = new Buffer(size);
		buffer.copy(result, 0, offset, size + offset);

		// return result
		return {
			name,
			value: result,
			size: size + offset,
		};
	}

	return parser;
}

module.exports = Binary;
