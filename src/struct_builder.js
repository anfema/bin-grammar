// Build a template structure
//
// definition: array of type parser functions
function makeTemplate(definition) {
	const result = {};

	for (const { makeStruct, name } of definition) {
		const r = makeStruct();

		result[name] = r;
	}

	return result;
}

// export everything
module.exports = makeTemplate;
