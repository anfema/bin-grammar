const test = require('ava');
const { parse, encode, template, binary, bcd, uint16 } = require('../index');
const { compareTemplate } = require('../src/helper.js');

test('binary_simple', (t) => {
	const definition = [binary('bin', { size: 2 })];
	const buffer = Buffer.from('0d0a', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.bin.length, 2);
	t.is(result.bin[0], 0x0d);
	t.is(result.bin[1], 0x0a);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { bin: null }), true);
});

test('binary_size_prefixed', (t) => {
	const definition = [binary('bin', { sizePrefixed: true, sizePrefixLength: 2 })];
	const buffer = Buffer.from('00020d0a', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.bin.length, 2);
	t.is(result.bin[0], 0x0d);
	t.is(result.bin[1], 0x0a);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { bin: null }), true);
});

test('binary_size_field', (t) => {
	const definition = [
		uint16('size'),
		binary('bin', { sizeField: 'size' }),
	];
	const buffer = Buffer.from('00020d0a', 'hex');
	const result = parse(definition, buffer);

	t.is(result.size, 2);
	t.is(result.bin.length, 2);
	t.is(result.bin[0], 0x0d);
	t.is(result.bin[1], 0x0a);

	result.size = 0; // invalidate size field to check if encoder overwrites it correctly
	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { size: null, bin: null }), true);
});

test('bcd_1byte', (t) => {
	const definition = [bcd('bcd', { size: 1 })];
	const buffer = Buffer.from('12', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.bcd, 12);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { bcd: null }), true);
});

test('bcd_4byte', (t) => {
	const definition = [bcd('bcd', { size: 4 })];
	const buffer = Buffer.from('12345678', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.bcd, 12345678);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { bcd: null }), true);
});

test("binary_reuse_with_undefined_size", (t) => {
	const definition = [binary("bin")];
	const buffer = Buffer.from("0d0a", "hex");
	const buffer2 = Buffer.from("0a0b0c0d", "hex");
	const parsed = parse(definition, buffer);
	const parsed2 = parse(definition, buffer2);
	const encoded = encode(definition, parsed);
	const encoded2 = encode(definition, parsed2);

	t.is(parsed.bin.length, 2);
	t.is(parsed.bin[0], 0x0d);
	t.is(parsed.bin[1], 0x0a);
	t.is(encoded.compare(buffer), 0);

	t.is(parsed2.bin.length, 4);
	t.is(parsed2.bin[0], 0x0a);
	t.is(parsed2.bin[1], 0x0b);
	t.is(parsed2.bin[2], 0x0c);
	t.is(parsed2.bin[3], 0x0d);
	t.is(encoded2.compare(buffer2), 0);
});
