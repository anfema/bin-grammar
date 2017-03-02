const test = require('ava');
const { parse, float, double } = require('../index');

test('float_le', (t) => {
	const buffer = Buffer.from('560e4940', 'hex');
	const result = parse([
		float('float', { bigEndian: false }),
	], buffer);

	t.is(result.float, 3.1414999961853027);
});

test('float_be', (t) => {
	const buffer = Buffer.from('40490e56', 'hex');
	const result = parse([
		float('float'),
	], buffer);

	t.is(result.float, 3.1414999961853027);
});

test('double_le', (t) => {
	const buffer = Buffer.from('6F1283C0CA210940', 'hex');
	const result = parse([
		double('double', { bigEndian: false }),
	], buffer);

	t.is(result.double, 3.1415);
});

test('double_be', (t) => {
	const buffer = Buffer.from('400921CAC083126F', 'hex');
	const result = parse([
		double('double'),
	], buffer);

	t.is(result.double, 3.1415);
});
