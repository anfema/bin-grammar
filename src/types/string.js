const { UInt } = require('./uint');

// String
//
// size: byte length or 0 if variable length
// encoding: the encoding the string is in
// nullTerminated: if size is 0 this defines a variable length string with a zero terminator
// sizePrefixed: if set it is assumed that the string is prefixed with it's length
// sizePrefixLength: length of the size prefix
// sizePrefixBigEndian: set big endian encoding for the size prefix
// sizeField: field in the parse tree that defines the size
// sizeFieldTransform: transform function applied to the size field before using the value
// transform: transform function applied before returning the string
//
// returns: parser function that returns transformed string (if `nullTerminated` = true, cut off at the first zero)
function BinString(name,
	{
		size = 0,
		encoding = 'ascii',
		nullTerminated = false,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian = false,
		sizeField,
		sizeFieldTransform = value => value,
		transform = value => value,
	}
) {
	if ((size === 0) && (nullTerminated === false) && (sizeField === undefined) && (sizePrefixed === false)) {
		throw new Error('Invalid string parser invocation, you have to specify `size` or `sizeField` or set `nullTerminated` to `true` or have a size prefix');
	}

	return function (buffer, parseTree) {
		let offset = 0;

		if (sizePrefixed) {
			const prefixParser = UInt('prefix', { size: sizePrefixLength, bigEndian: sizePrefixBigEndian });
			const result = prefixParser(buffer);

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
				name,
				value: transform(buffer.toString(encoding, offset, end)),
				size: size + offset,
			};
		} else if (nullTerminated && !sizePrefixed) {
			// variable length string with no size hint
			let end = buffer.length;

			for(let i = 0; i < buffer.length; i += 1) {
				if (buffer[i] === 0x00) {
					end = i;
					size = end + 1;
					break;
				}
			}

			return {
				name,
				value: transform(buffer.toString(encoding, 0, end)),
				size,
			};
		} else if (sizePrefixed) {
			// zero length string is possible, so return zero string
			return {
				name,
				value: transform(''),
				size: offset,
			};
		}
		throw new Error('Invalid size, `sizeField` not found?');
	};
}

// ASCII encoded integer (aka. human readable number)
//
// size: byte length or 0 if variable length
// nullTerminated: if size is 0 this defines a variable length string with a zero terminator
// sizePrefixed: if set it is assumed that the string is prefixed with it's length
// sizePrefixLength: length of the size prefix
// sizePrefixBigEndian: set big endian encoding for the size prefix
// sizeField: field in the parse tree that defines the size
// sizeFieldTransform: transform function applied to the size field before using the value
// transform: transform function applied before returning the number
//
// returns: parser function that returns transformed number
function ASCIIInteger(name,
	{
		size = 0,
		nullTerminated = false,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian = false,
		sizeField,
		sizeFieldTransform = value => value,
		transform = value => value,
	}
) {
	return BinString(name, {
		size,
		nullTerminated,
		sizePrefixed,
		sizePrefixLength,
		sizePrefixBigEndian,
		sizeField,
		sizeFieldTransform,
		transform: value => transform(parseInt(value, 10)),
	});
}

// ASCII encoded float or double (aka. human readable number)
//
// size: byte length or 0 if variable length
// nullTerminated: if size is 0 this defines a variable length string with a zero terminator
// sizePrefixed: if set it is assumed that the string is prefixed with it's length
// sizePrefixLength: length of the size prefix
// sizePrefixBigEndian: set big endian encoding for the size prefix
// sizeField: field in the parse tree that defines the size
// sizeFieldTransform: transform function applied to the size field before using the value
// transform: transform function applied before returning the number
//
// returns: parser function that returns transformed number
function ASCIIFloat(name,
	{
		size = 0,
		nullTerminated = false,
		sizePrefixed = false,
		sizePrefixLength = 0,
		sizePrefixBigEndian = false,
		sizeField,
		sizeFieldTransform = value => value,
		transform = value => value,
	}
) {
	return BinString(name, {
		size,
		nullTerminated,
		sizePrefixed,
		sizePrefixLength,
		sizePrefixBigEndian,
		sizeField,
		sizeFieldTransform,
		transform: value => transform(parseFloat(value)),
	});
}

// export everything
module.exports = {
	BinString,
	ASCIIInteger,
	ASCIIFloat,
};
