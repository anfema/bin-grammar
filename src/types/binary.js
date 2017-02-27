const { UInt } = require('./uint');

// Binary data
//
// size: byte length or `undefined` if variable length
// sizeField: if set use this field name from the parse tree for the size of this data item
// sizePrefixed: if set it is assumed that the data is prefixed with it's length
// sizePrefixLength: length of the size prefix
// bigEndian: set big endian encoding for the size prefix
// sizeFieldTransform: transform function to call before using the value of the size field
// transform: result value transform function to call on the data before returning it as result
//
// returns: parser function that returns transformed buffer
function Binary(name,
	{
		size,
		sizeField,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian = true,
		sizeFieldTransform = value => value,
		transform = value => value,
	} = {}
) {
	return function (buffer, parseTree) {
		let offset = 0;

		// determine size to copy to result buffer
		if (sizePrefixed) {
			const prefixParser = UInt('prefix', { size: sizePrefixLength, bigEndian: sizePrefixBigEndian });
			const result = prefixParser(buffer);

			size = result.value;
			offset = result.size;
		}
		if (sizeField) {
			size = sizeFieldTransform(parseTree[sizeField]);
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
			value: transform(result),
			size: size + offset,
		};
	};
}

// Packed BCD number
//
// Example: 0x12 0x34 => 1234
//
// size: byte length or `undefined` if variable length
// sizeField: if set use this field name from the parse tree for the size of this data item
// sizePrefixed: if set it is assumed that the data is prefixed with it's length
// sizePrefixLength: length of the size prefix
// sizePrefixBigEndian: set big endian encoding for the size prefix
// sizeFieldTransform: transform function to call before using the value of the size field
// transform: result value transform function to call on the data before returning it as result
//
// returns: parser function that returns transformed BCD number
function BCD(name,
	{
		size,
		sizeField,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian = true,
		sizeFieldTransform = value => value,
		transform = value => value,
	}
) {
	return Binary(name, {
		size,
		sizeField,
		sizePrefixed,
		sizePrefixLength,
		sizeFieldTransform,
		sizePrefixBigEndian,
		transform: (value) => {
			let result = 0;

			for (const character of value) {
				result = result * 100 + (((character & 0xf0) >> 4) * 10 + (character & 0x0f));
			}

			return transform(result);
		},
	});
}

// export everything
module.exports = {
	Binary,
	BCD,
};
