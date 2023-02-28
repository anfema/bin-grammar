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
	let instanceSize = size;

	function parse(buffer, parseTree, { bigEndian }) {
		let offset = 0;
		instanceSize = size;

		// determine size to copy to result buffer
		if (sizePrefixed) {
			const { parse: prefixParser } = uint('prefix', { size: sizePrefixLength, bigEndian: sizePrefixBigEndian });
			const result = prefixParser(buffer, {}, { bigEndian });

			instanceSize = result.value;
			offset = result.size;
		}
		if (sizeField) {
			instanceSize = sizeFieldTransform(parseTree[sizeField]);
		}
		if (instanceSize === undefined) {
			instanceSize = buffer.length;
		}

		// just copy data to result
		const result = new Buffer(instanceSize);

		buffer.copy(result, 0, offset, instanceSize + offset);

		// return result
		return {
			value: transform(result),
			size: instanceSize + offset,
		};
	}

	function prepareEncode(object, parseTree, { bigEndian }) {
		if (size === undefined) {
			instanceSize = object.length;
		}

		if (sizeField) {
			parseTree[sizeField] = sizeFieldReverseTransform(instanceSize);
		}
	}

	function encode(object, { bigEndian }) {
		const transformed = reverseTransform(object);
		const bufferItems = [transformed];

		if (sizePrefixed) {
			const { encode: prefixEncoder } = uint('prefix', { size: sizePrefixLength, bigEndian: sizePrefixBigEndian });
			const result = prefixEncoder(transformed.length, { bigEndian });

			bufferItems.unshift(result);
			instanceSize = transformed.length + sizePrefixLength;
		}
		if (instanceSize === undefined) {
			instanceSize = transformed.length;
		}

		// build buffer
		let data = Buffer.concat(bufferItems);

		if (data.length < instanceSize) {
			// if the buffer was shorter than anticipated, pad with zeroes
			data = Buffer.concat([data, Buffer.alloc(instanceSize - data.length)]);
		} else if (data.length > instanceSize) {
			// if the buffer was longer just cut it off
			data = data.slice(0, instanceSize);
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
