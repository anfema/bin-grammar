// Build a template structure
//
// definition: array of type parser functions
function makeTemplate(definition, subItems = {}) {
	const result = {};

	for (const { makeStruct, name } of definition) {
		const selector = subItems[name];
		const r = makeStruct(result, selector);

		result[name] = r;
	}

	return result;
}

// export everything
module.exports = makeTemplate;
