const test = require('ava');
const { BinParser, BinString } = require('../index');

test('string_fixed', t => {
	const buffer = Buffer.from('48656C6C6F20776F726C6421212121', 'hex');
	const result = BinParser([
		BinString('str', { size: 12 })
	], buffer);

	t.is(result.str, 'Hello world!');
});


test('string_fixed_null_terminated', t => {
	const buffer = Buffer.from('48656C6C6F20776F726C64210021212121', 'hex');
	const result = BinParser([
		BinString('str', { size: 16, nullTerminated: true })
	], buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');
});

test('string_variable_null_terminated', t => {
	const buffer = Buffer.from('48656C6C6F20776F726C64210021212121', 'hex');
	const result = BinParser([
		BinString('str', { nullTerminated: true })
	], buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');
});


test('string_fixed_size_prefix', t => {
	const buffer = Buffer.from('0c48656C6C6F20776F726C6421212121', 'hex');
	const result = BinParser([
		BinString('str', { sizePrefixed: true, sizePrefixLength: 1 })
	], buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');
});

test('string_fixed_size_prefix_null_terminated', t => {
	const buffer = Buffer.from('0f48656C6C6F20776F726C64210021212121', 'hex');
	const result = BinParser([
		BinString('str', { sizePrefixed: true, sizePrefixLength: 1, nullTerminated: true })
	], buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');
});

test('string_fixed_size_prefix_empty', t => {
	const buffer = Buffer.from('0048656C6C6F20776F726C64210021212121', 'hex');
	const result = BinParser([
		BinString('str', { sizePrefixed: true, sizePrefixLength: 1, nullTerminated: true })
	], buffer);

	t.is(result.str.length, 0);
	t.is(result.str, '');
});

test('string_variable_empty', t => {
	const buffer = Buffer.from('0048656C6C6F20776F726C64210021212121', 'hex');
	const result = BinParser([
		BinString('str', { nullTerminated: true })
	], buffer);

	t.is(result.str.length, 0);
	t.is(result.str, '');
});

test('string_variable_hex_encoded', t => {
	const buffer = Buffer.from('48656C6C6F20776F726C64210021212121', 'hex');
	const result = BinParser([
		BinString('str', { nullTerminated: true, encoding: 'hex' })
	], buffer);

	t.is(result.str.length, 24);
	t.is(result.str, '48656c6c6f20776f726c6421');
});

test.todo('BinString: sizeField test');
test.todo('ASCIIInteger: test');
test.todo('ASCIIFloat: test');
