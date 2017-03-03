const { uint } = require('./uint');

// Binary data
//
// size: byte length or `undefined` if variable length
// sizeField: if set use this field name from the parse tree for the size of this data item
// sizePrefixed: if set it is assumed that the data is prefixed with it's length
// sizePrefixLength: length of the size prefix
// bigEndian: override big endian encoding for the size prefix
// sizeFieldTransform: transform function to call before using the value of the size field
// transform: result value transform function to call on the data before returning it as result
// reverseTransform: reverse of the transform function to be used in encoding
//
// returns: parser function that returns transformed buffer
function binary(name,
	{
		size,
		sizeField,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian,
		sizeFieldTransform = value => value,
		sizeFieldReverseTransform = value => value,
		transform = value => value,
		reverseTransform = value => value,
	} = {}
) {
	function parse(buffer, parseTree, { bigEndian }) {
		let offset = 0;

		// determine size to copy to result buffer
		if (sizePrefixed) {
			const { parse: prefixParser } = uint('prefix', { size: sizePrefixLength, bigEndian: sizePrefixBigEndian });
			const result = prefixParser(buffer, {}, { bigEndian });

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
			value: transform(result),
			size: size + offset,
		};
	}

	function prepareEncode(object, parseTree) {
		if (size === undefined) {
			size = object.length;
		}

		if (sizeField) {
			parseTree[sizeField] = sizeFieldReverseTransform(size);
		}
	}

	function encode(object, { bigEndian }) {
		const transformed = reverseTransform(object);
		const bufferItems = [transformed];

		if (sizePrefixed) {
			const { encode: prefixEncoder } = uint('prefix', { size: sizePrefixLength, bigEndian: sizePrefixBigEndian });
			const result = prefixEncoder(transformed.length, { bigEndian });

			bufferItems.unshift(result);
			size = transformed.length + sizePrefixLength;
		}
		if (size === undefined) {
			size = transformed.length;
		}

		// build buffer
		let data = Buffer.concat(bufferItems);

		if (data.length < size) {
			// if the buffer was shorter than anticipated, pad with zeroes
			data = Buffer.concat([data, Buffer.alloc(size - data.length)]);
		} else if (data.length > size) {
			// if the buffer was longer just cut it off
			data = data.slice(0, size);
		}

		return data;
	}

	function makeStruct() {
		return Buffer.alloc(0);
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// Packed BCD number
//
// Example: 0x12 0x34 => 1234
//
// size: byte length or `undefined` if variable length
// sizeField: if set use this field name from the parse tree for the size of this data item
// sizePrefixed: if set it is assumed that the data is prefixed with it's length
// sizePrefixLength: length of the size prefix
// sizePrefixBigEndian: override big endian encoding for the size prefix
// sizeFieldTransform: transform function to call before using the value of the size field
// transform: result value transform function to call on the data before returning it as result
// reverseTransform: reverse of the transform function to be used in encoding
//
// returns: parser function that returns transformed BCD number
function bcd(name,
	{
		size,
		sizeField,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian,
		sizeFieldTransform = value => value,
		sizeFieldReverseTransform = value => value,
		transform = value => value,
		reverseTransform = value => value,
	}
) {
	return binary(name, {
		size,
		sizeField,
		sizePrefixed,
		sizePrefixLength,
		sizeFieldTransform,
		sizeFieldReverseTransform,
		sizePrefixBigEndian,
		transform: (value) => {
			let result = 0;

			for (const character of value) {
				result = result * 100 + (((character & 0xf0) >> 4) * 10 + (character & 0x0f));
			}

			return transform(result);
		},
		reverseTransform: value => Buffer.from(reverseTransform(value).toString(10), 'hex'),
	});
}

// export everything
module.exports = {
	binary,
	bcd,
};
