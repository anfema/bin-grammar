const { binString } = require('./string');
const { binary } = require('./binary');

// Fixed magic string or Buffer, often used for packet sync or file type headers
//
// data: the expected data to find (string or buffer)
// encoding: if data is a string this defines the string encoding
//
// returns: parser function that returns true if magic matches, false if it does not
function magic(name,
	{
		data,
		encoding = 'ascii',
	}
) {
	let extractor;

	// determine how to extract the magic
	if (typeof data === 'string') {
		extractor = binString(name, { size: data.length, encoding });
	} else if (data instanceof Buffer) {
		extractor = binary(name, { size: data.length });
	} else {
		throw new Error('Magic parser only accepts `Buffer` or `String`');
	}

	function parse(buffer, parseTree, { bigEndian }) {
		const { value, size } = extractor.parse(buffer, {}, { bigEndian });

		// string and buffer need different comparison methods
		let valid = false;
		if (value instanceof Buffer) {
			valid = (value.compare(data) === 0);
		} else {
			valid = (value === data);
		}

		return {
			value: valid,
			size,
		};
	}

	function prepareEncode(object, parseTree, { bigEndian }) {
	}

	function encode(object, { bigEndian }) {
		return Buffer.from(data);
	}

	function makeStruct() {
		return Buffer.from(data);
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// export everything
module.exports = magic;
