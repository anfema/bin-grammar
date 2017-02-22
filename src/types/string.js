const { UInt } = require('./uint');

// String
//
// size: byte length or 0 if variable length
// nullTerminated: if size is 0 this defines a variable length string with a zero terminator
// sizePrefixed: if set it is assumed that the string is prefixed with it's length
// sizePrefixLength: length of the size prefix
// sizeField: field in the parse tree that defines the size
// bigEndian: set big endian encoding for the size prefix
// encoding: the encoding the string is in
//
// returns: parser function that returns string (if `nullTerminated` = true, cut off at the first zero)
function BinString(name, {size = 0, nullTerminated = false, sizePrefixed = false, sizePrefixLength = 0, bigEndian = false, sizeField, encoding = 'ascii'}) {
	if ((size === 0) && (nullTerminated === false) && (sizeField === undefined) && (sizePrefixed === false)) {
		throw new Error('Invalid string parser invocation, you have to specify `size` or `sizeField` or set `nullTerminated` to `true` or have a size prefix');
	}

	let parser = function(buffer, parseTree) {
		let offset = 0;

		if (sizePrefixed) {
			const prefixParser = UInt('prefix', { size: sizePrefixLength, bigEndian })
			const result = prefixParser(buffer);
			size = result.value;
			offset = result.size;
		}
		if (sizeField) {
			size = parseTree[sizeField];
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
				value: buffer.toString(encoding, offset, end),
				size: size + offset,
			};
		} else if (nullTerminated && !sizePrefixed) {
			// variable length string with no size hint
			let end = buffer.length;
			for(let i = 0; i < buffer.length; i += 1) {
				if (buffer[i] === 0x00) {
					end = i;
					break;
				}
			}

			return {
				name,
				value: buffer.toString(encoding, 0, end),
				size: end,
			};
		} else if (sizePrefixed) {
			// zero length string is possible, so return zero string
			return {
				name,
				value: '',
				size: offset,
			}
		} else {
			throw new Error('Invalid size, `sizeField` not found?');
		}
	}

	return parser;
}

module.exports = BinString;
