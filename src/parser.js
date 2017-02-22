// Parse a binary buffer
//
// definition: array of array, first element = name, second element = type instance
// buffer: buffer to parse
function parse(definition, buffer) {
	let offset = 0;
	const result = {};

	for (item of definition) {
		const slice = buffer.slice(offset, buffer.length);

		const { name, value, size } = item(slice, result);
		result[name] = value;
		offset += size;
	}

	return result;
}

module.exports = parse;
