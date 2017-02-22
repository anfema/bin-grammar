const test = require('ava');
const { BinParser, Binary } = require('../index');

test('binary_simple', t => {
	const buffer = Buffer.from('0d0a', 'hex');
	const result = BinParser([
		Binary('bin', { size: 2 })
	], buffer);

	t.is(result.bin.length, 2);
	t.is(result.bin[0], 0x0d);
	t.is(result.bin[1], 0x0a);
});

test('binary_size_prefixed', t => {
	const buffer = Buffer.from('00020d0a', 'hex');
	const result = BinParser([
		Binary('bin', { sizePrefixed: true, sizePrefixLength: 2 })
	], buffer);

	t.is(result.bin.length, 2);
	t.is(result.bin[0], 0x0d);
	t.is(result.bin[1], 0x0a);
});
