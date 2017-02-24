const test = require('ava');
const { BinParser, Binary, BCD, UInt16 } = require('../index');

test('binary_simple', (t) => {
	const buffer = Buffer.from('0d0a', 'hex');
	const result = BinParser([
		Binary('bin', { size: 2 }),
	], buffer);

	t.is(result.bin.length, 2);
	t.is(result.bin[0], 0x0d);
	t.is(result.bin[1], 0x0a);
});

test('binary_size_prefixed', (t) => {
	const buffer = Buffer.from('00020d0a', 'hex');
	const result = BinParser([
		Binary('bin', { sizePrefixed: true, sizePrefixLength: 2 }),
	], buffer);

	t.is(result.bin.length, 2);
	t.is(result.bin[0], 0x0d);
	t.is(result.bin[1], 0x0a);
});

test('binary_size_field', (t) => {
	const buffer = Buffer.from('00020d0a', 'hex');
	const result = BinParser([
		UInt16('size'),
		Binary('bin', { sizeField: 'size' }),
	], buffer);

	t.is(result.size, 2);
	t.is(result.bin.length, 2);
	t.is(result.bin[0], 0x0d);
	t.is(result.bin[1], 0x0a);
});

test('bcd_1byte', (t) => {
	const buffer = Buffer.from('12', 'hex');
	const result = BinParser([
		BCD('bcd', { size: 1 }),
	], buffer);

	t.is(result.bcd, 12);
});

test('bcd_4byte', (t) => {
	const buffer = Buffer.from('12345678', 'hex');
	const result = BinParser([
		BCD('bcd', { size: 4 }),
	], buffer);

	t.is(result.bcd, 12345678);
});
