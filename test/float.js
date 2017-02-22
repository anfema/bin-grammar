const test = require('ava');
const { BinParser, Float, Double } = require('../index');

test('float_le', t => {
	const buffer = Buffer.from('560e4940', 'hex');
	const result = BinParser([
		Float('float', { bigEndian: false })
	], buffer);

	t.is(result.float, 3.1414999961853027);
});

test('float_be', t => {
	const buffer = Buffer.from('40490e56', 'hex');
	const result = BinParser([
		Float('float')
	], buffer);

	t.is(result.float, 3.1414999961853027);
});

test('double_le', t => {
	const buffer = Buffer.from('6F1283C0CA210940', 'hex');
	const result = BinParser([
		Double('double', { bigEndian: false })
	], buffer);

	t.is(result.double, 3.1415);
});

test('double_be', t => {
	const buffer = Buffer.from('400921CAC083126F', 'hex');
	const result = BinParser([
		Double('double')
	], buffer);

	t.is(result.double, 3.1415);
});
