// Parse a binary buffer
//
// definition: array of type parser functions
// buffer: buffer to parse
// options:
//  - `bigEndian`: default endianness of parser (default: `true`)
function parse(definition, buffer, { bigEndian = true } = {}) {
	let offset = 0;
	const result = {};

	for (const { parse: parseItem, name } of definition) {
		const slice = buffer.slice(offset, buffer.length);
		const r = parseItem(slice, result, { bigEndian });

		result[name] = r.value;
		offset += r.size;
	}

	return result;
}

// export everything
module.exports = parse;
