const test = require('ava');
const { parse, encode, template, float, double } = require('../index');
const { compareTemplate } = require('../src/helper.js');

test('float_le', (t) => {
	const definition = [float('float', { bigEndian: false })];
	const buffer = Buffer.from('560e4940', 'hex');
	const result = parse(definition, buffer);

	t.is(result.float, 3.1414999961853027);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { float: null }), true);
});

test('float_be', (t) => {
	const definition = [float('float')];
	const buffer = Buffer.from('40490e56', 'hex');
	const result = parse(definition, buffer);

	t.is(result.float, 3.1414999961853027);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { float: null }), true);
});

test('double_le', (t) => {
	const definition = [double('double', { bigEndian: false })];
	const buffer = Buffer.from('6F1283C0CA210940', 'hex');
	const result = parse(definition, buffer);

	t.is(result.double, 3.1415);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { double: null }), true);
});

test('double_be', (t) => {
	const definition = [double('double')];
	const buffer = Buffer.from('400921CAC083126F', 'hex');
	const result = parse(definition, buffer);

	t.is(result.double, 3.1415);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { double: null }), true);
});
