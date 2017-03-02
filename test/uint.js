const test = require('ava');
const { parse, encode, template, uint, uint8, uint16, uint32 } = require('../index');
const { compareTemplate } = require('../src/helper.js');

test('uint8_single', (t) => {
	const definition = [uint8('uint')];
	const buffer = Buffer.from('ff', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint, 255);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint: null }), true);
});

test('uint8_multiple_following', (t) => {
	const definition = [
		uint8('uint1'),
		uint8('uint2'),
		uint8('uint3'),
	];
	const buffer = Buffer.from('ff0102', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint1, 255);
	t.is(result.uint2, 1);
	t.is(result.uint3, 2);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint1: null, uint2: null, uint3: null }), true);
});

test('uint16be_single', (t) => {
	const definition = [uint16('uint')];
	const buffer = Buffer.from('00ff', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint, 255);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint: null }), true);
});

test('uint16le_single', (t) => {
	const definition = [uint16('uint', { bigEndian: false })];
	const buffer = Buffer.from('ff00', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint, 255);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint: null }), true);
});

test('uint16be_multiple_following', (t) => {
	const definition = [
		uint16('uint1'),
		uint16('uint2'),
		uint16('uint3'),
	];
	const buffer = Buffer.from('00ff00011000', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint1, 255);
	t.is(result.uint2, 1);
	t.is(result.uint3, 4096);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint1: null, uint2: null, uint3: null }), true);
});

test('uint16le_multiple_following', (t) => {
	const definition = [
		uint16('uint1', { bigEndian: false }),
		uint16('uint2', { bigEndian: false }),
		uint16('uint3', { bigEndian: false }),
	];
	const buffer = Buffer.from('ff0001000010', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint1, 255);
	t.is(result.uint2, 1);
	t.is(result.uint3, 4096);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint1: null, uint2: null, uint3: null }), true);
});

test('uint24be_single', (t) => {
	const definition = [uint('uint', { size: 3 })];
	const buffer = Buffer.from('0100ff', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint, 65791);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint: null }), true);
});

test('uint24le_single', (t) => {
	const definition = [uint('uint', { size: 3, bigEndian: false })];
	const buffer = Buffer.from('ff0001', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint, 65791);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint: null }), true);
});

test('uint32be_single', (t) => {
	const definition = [uint32('uint')];
	const buffer = Buffer.from('000100ff', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint, 65791);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint: null }), true);
});

test('uint32le_single', (t) => {
	const definition = [uint32('uint', { bigEndian: false })];
	const buffer = Buffer.from('ff000100', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.uint, 65791);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { uint: null }), true);
});
