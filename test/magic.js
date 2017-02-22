const test = require('ava');
const { BinParser, Magic } = require('../index');

test('magic_success', t => {
	const buffer = Buffer.from('0d0a', 'hex');
	const result = BinParser([
		Magic('magic', { size: 1, data: Buffer.from('0d0a', 'hex') })
	], buffer);

	t.is(result.magic, true);
});

test('magic_fail', t => {
	const buffer = Buffer.from('0d0a', 'hex');
	const result = BinParser([
		Magic('magic', { size: 1, data: Buffer.from('ff00', 'hex') })
	], buffer);

	t.is(result.magic, false);
});

test.todo('Magic: string data test');
