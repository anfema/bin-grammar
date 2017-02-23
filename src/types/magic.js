const { BinString } = require('./string');
const { Binary } = require('./binary');

// Fixed magic string or Buffer, often used for packet sync or file type headers
//
// data: the expected data to find (string or buffer)
// encoding: if data is a string this defines the string encoding
//
// returns: parser function that returns true if magic matches, false if it does not
function Magic(name,
	{
		data,
		encoding = 'ascii'
	}
) {
	let extractor;

	// determine how to extract the magic
	if (typeof data === 'string') {
		extractor = BinString(name, { size: data.length, encoding });
	} else if (data instanceof Buffer) {
		extractor = Binary(name, { size: data.length });
	} else {
		throw new Error('Magic parser only accepts `Buffer` or `String`');
	}

	return function(buffer) {
		const { value, size } = extractor(buffer);

		// string and buffer need different comparison methods
		let valid = false;
		if (value instanceof Buffer) {
			valid = (value.compare(data) === 0);
		} else {
			valid = (value === data);
		}

		return {
			name,
			value: valid,
			size,
		};
	};
}

// export everything
module.exports = Magic;
