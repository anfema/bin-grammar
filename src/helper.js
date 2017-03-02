
function compareTemplate(a, b) {
	const ka = Object.keys(a);
	const kb = Object.keys(b);

	for (const key of ka) {
		let found = false;

		for (const check of kb) {
			if (key === check) {
				found = true;
				break;
			}
		}

		if (!found) {
			return false;
		}

		if (typeof ka[key] === 'object') {
			if (compareTemplate(ka[key], kb[key]) === false) {
				return false;
			}
		}
	}

	return true;
}

module.exports = {
	compareTemplate,
};
