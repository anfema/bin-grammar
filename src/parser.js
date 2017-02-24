// Parse a binary buffer
//
// definition: array of type parser functions
// buffer: buffer to parse
function parse(definition, buffer) {
	let offset = 0;
	const result = {};

	for (const item of definition) {
		const slice = buffer.slice(offset, buffer.length);
		const r = item(slice, result);

		result[r.name] = r.value;
		offset += r.size;
	}

	return result;
}

// export everything
module.exports = parse;
