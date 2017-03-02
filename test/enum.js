const test = require('ava');
const { parse, encode, template, enumeration } = require('../index');
const { compareTemplate } = require('../src/helper.js');

test('enum_single', (t) => {
	const definition = [
		enumeration('enum', {
			choices: {
				one: 1,
				two: 2,
			},
		}),
	];
	const buffer = Buffer.from('02', 'hex');
	const result = parse(definition, buffer);

	t.is(result.enum, 'two');

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { enum: null }), true);
});

test('enum_null', (t) => {
	const definition = [
		enumeration('enum', {
			choices: {
				one: 1,
				two: 2,
			},
		}),
	];
	const buffer = Buffer.from('03', 'hex');
	const result = parse(definition, buffer);

	t.is(result.enum, null);

	const encoded = encode(definition, result);

	// invalid values get reduced to zeros
	t.is(encoded.compare(Buffer.from('00', 'hex')), 0);

	t.is(compareTemplate(template(definition), { enum: null }), true);
});
