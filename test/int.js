const test = require('ava');
const { parse, encode, template, int8, int16, int32 } = require('../index');
const { compareTemplate } = require('../src/helper.js');

test('int8_single', (t) => {
	const definition = [int8('int')];
	const buffer = Buffer.from('01', 'hex');
	const result = parse(definition, buffer);

	t.is(result.int, 1);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { int: null }), true);
});

test('int8_negative_single', (t) => {
	const definition = [int8('int')];
	const buffer = Buffer.from('ff', 'hex');
	const result = parse(definition, buffer);

	t.is(result.int, -1);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('int16_single', (t) => {
	const definition = [int16('int')];
	const buffer = Buffer.from('0101', 'hex');
	const result = parse(definition, buffer);

	t.is(result.int, 257);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { int: null }), true);
});

test('int16_negative_single', (t) => {
	const definition = [int16('int')];
	const buffer = Buffer.from('8101', 'hex');
	const result = parse(definition, buffer);

	t.is(result.int, -32511);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { int: null }), true);
});

test('int32_single', (t) => {
	const definition = [int32('int')];
	const buffer = Buffer.from('538AF607', 'hex');
	const result = parse(definition, buffer);

	t.is(result.int, 1401615879);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { int: null }), true);
});

test('int32_negative_single', (t) => {
	const definition = [int32('int')];
	const buffer = Buffer.from('D38AF607', 'hex');
	const result = parse(definition, buffer);

	t.is(result.int, -745867769);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { int: null }), true);
});
