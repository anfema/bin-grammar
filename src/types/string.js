const { uint } = require('./uint');

// String
//
// size: byte length or 0 if variable length
// encoding: the encoding the string is in
// nullTerminated: if size is 0 this defines a variable length string with a zero terminator
// sizePrefixed: if set it is assumed that the string is prefixed with it's length
// sizePrefixLength: length of the size prefix
// sizePrefixBigEndian: override big endian encoding for the size prefix
// sizeField: field in the parse tree that defines the size
// sizeFieldTransform: transform function applied to the size field before using the value
// sizeFieldReverseTransform: reverse of the transform function for encoding
// transform: transform function applied before returning the string
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns transformed string (if `nullTerminated` = true, cut off at the first zero)
function binString(name,
	{
		size = 0,
		encoding = 'ascii',
		nullTerminated = false,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian,
		sizeField,
		sizeFieldTransform = value => value,
		sizeFieldReverseTransform = value => value,
		transform = value => value,
		reverseTransform = value => value,
	}
) {
	if ((size === 0) && (nullTerminated === false) && (sizeField === undefined) && (sizePrefixed === false)) {
		throw new Error('Invalid string parser invocation, you have to specify `size` or `sizeField` or set `nullTerminated` to `true` or have a size prefix');
	}

	function parse(buffer, parseTree, { bigEndian: inheritBigEndian }) {
		let offset = 0;

		if (sizePrefixBigEndian === undefined) {
			sizePrefixBigEndian = inheritBigEndian;
		}

		if (sizePrefixed) {
			const prefixParser = uint('prefix', { size: sizePrefixLength, bigEndian: sizePrefixBigEndian }).parse;
			const result = prefixParser(buffer, {}, { bigEndian: inheritBigEndian });

			size = result.value;
			offset = result.size;
		}
		if (sizeField) {
			size = sizeFieldTransform(parseTree[sizeField]);
		}

		if (size > 0) {
			// cut of at first zero byte if `nullTerminated` is set
			let end = size + offset;

			if (nullTerminated) {
				for(let i = offset; i < size + offset; i += 1) {
					if (buffer[i] === 0x00) {
						end = i;
						break;
					}
				}
			}

			return {
				value: transform(buffer.toString(encoding, offset, end)),
				size: size + offset,
			};
		} else if (nullTerminated && !sizePrefixed) {
			// variable length string with no size hint
			let end = buffer.length;
			let sz = size;

			for(let i = 0; i < buffer.length; i += 1) {
				if (buffer[i] === 0x00) {
					end = i;
					sz = end + 1;
					break;
				}
			}

			return {
				value: transform(buffer.toString(encoding, 0, end)),
				size: sz,
			};
		} else if (sizePrefixed) {
			// zero length string is possible, so return zero string
			return {
				value: transform(''),
				size: offset,
			};
		}
		throw new Error('Invalid size, `sizeField` not found?');
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
		const transformed = Buffer.from(reverseTransform(object), encoding);
		const bufferItems = [transformed];

		if (sizePrefixed) {
			let sz = transformed.length;

			if (nullTerminated) {
				sz += 1;
			}

			const { encode: prefixEncoder } = uint('prefix', { size: sizePrefixLength, bigEndian: sizePrefixBigEndian });
			const result = prefixEncoder(sz, { bigEndian });

			bufferItems.unshift(result);
			size = sz + sizePrefixLength;
		}
		if (size === undefined) {
			size = transformed.length;
		}
		if (nullTerminated) {
			bufferItems.push(Buffer.alloc(1));
			if (size === 0) {
				size = transformed.length + 1;
			}
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
		return reverseTransform('');
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// ASCII encoded integer (aka. human readable number)
//
// size: byte length or 0 if variable length
// nullTerminated: if size is 0 this defines a variable length string with a zero terminator
// sizePrefixed: if set it is assumed that the string is prefixed with it's length
// sizePrefixLength: length of the size prefix
// sizePrefixBigEndian: override big endian encoding for the size prefix
// sizeField: field in the parse tree that defines the size
// sizeFieldTransform: transform function applied to the size field before using the value
// sizeFieldReverseTransform: reverse of the transform function for encoding
// transform: transform function applied before returning the number
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns transformed number
function asciiInteger(name,
	{
		size = 0,
		nullTerminated = false,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian,
		sizeField,
		sizeFieldTransform = value => value,
		sizeFieldReverseTransform = value => value,
		transform = value => value,
		reverseTransform = value => value,
	}
) {
	return binString(name, {
		size,
		nullTerminated,
		sizePrefixed,
		sizePrefixLength,
		sizePrefixBigEndian,
		sizeField,
		sizeFieldTransform,
		sizeFieldReverseTransform,
		transform: value => transform(parseInt(value, 10)),
		reverseTransform: value => reverseTransform(value).toString(10),
	});
}

// ASCII encoded float or double (aka. human readable number)
//
// size: byte length or 0 if variable length
// nullTerminated: if size is 0 this defines a variable length string with a zero terminator
// sizePrefixed: if set it is assumed that the string is prefixed with it's length
// sizePrefixLength: length of the size prefix
// sizePrefixBigEndian: override big endian encoding for the size prefix
// sizeField: field in the parse tree that defines the size
// sizeFieldTransform: transform function applied to the size field before using the value
// sizeFieldReverseTransform: reverse of the transform function for encoding
// transform: transform function applied before returning the number
// reverseTransform: reverse of the transform function for encoding
//
// returns: parser function that returns transformed number
function asciiFloat(name,
	{
		size = 0,
		nullTerminated = false,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian,
		sizeField,
		sizeFieldTransform = value => value,
		sizeFieldReverseTransform = value => value,
		transform = value => value,
		reverseTransform = value => value,
	}
) {
	return binString(name, {
		size,
		nullTerminated,
		sizePrefixed,
		sizePrefixLength,
		sizePrefixBigEndian,
		sizeField,
		sizeFieldTransform,
		sizeFieldReverseTransform,
		transform: value => transform(parseFloat(value)),
		reverseTransform: value => reverseTransform(value).toString(10),
	});
}

// export everything
module.exports = {
	binString,
	asciiInteger,
	asciiFloat,
};
