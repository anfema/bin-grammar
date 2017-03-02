const test = require('ava');
const { parse, binString, uint8, asciiFloat, asciiInteger } = require('../index');

test('string_fixed', (t) => {
	const buffer = Buffer.from('48656C6C6F20776F726C6421212121', 'hex');
	const result = parse([
		binString('str', { size: 12 }),
	], buffer);

	t.is(result.str, 'Hello world!');
});

test('string_fixed_null_terminated', (t) => {
	const buffer = Buffer.from('48656C6C6F20776F726C64210021212121', 'hex');
	const result = parse([
		binString('str', { size: 16, nullTerminated: true }),
	], buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');
});

test('string_variable_null_terminated', (t) => {
	const buffer = Buffer.from('48656C6C6F20776F726C64210021212121', 'hex');
	const result = parse([
		binString('str', { nullTerminated: true }),
	], buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');
});

test('string_variable_null_terminated_following', (t) => {
	const buffer = Buffer.from('48656C6C6F20776F726C6421002121212100', 'hex');
	const result = parse([
		binString('str1', { nullTerminated: true }),
		binString('str2', { nullTerminated: true }),
	], buffer);

	t.is(result.str1.length, 12);
	t.is(result.str1, 'Hello world!');
	t.is(result.str2.length, 4);
	t.is(result.str2, '!!!!');
});

test('string_fixed_size_prefix', (t) => {
	const buffer = Buffer.from('0c48656C6C6F20776F726C6421212121', 'hex');
	const result = parse([
		binString('str', { sizePrefixed: true, sizePrefixLength: 1 }),
	], buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');
});

test('string_fixed_size_prefix_null_terminated', (t) => {
	const buffer = Buffer.from('0f48656C6C6F20776F726C64210021212121', 'hex');
	const result = parse([
		binString('str', { sizePrefixed: true, sizePrefixLength: 1, nullTerminated: true }),
	], buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');
});

test('string_fixed_size_prefix_empty', (t) => {
	const buffer = Buffer.from('0048656C6C6F20776F726C64210021212121', 'hex');
	const result = parse([
		binString('str', { sizePrefixed: true, sizePrefixLength: 1, nullTerminated: true }),
	], buffer);

	t.is(result.str.length, 0);
	t.is(result.str, '');
});

test('string_variable_empty', (t) => {
	const buffer = Buffer.from('0048656C6C6F20776F726C64210021212121', 'hex');
	const result = parse([
		binString('str', { nullTerminated: true }),
	], buffer);

	t.is(result.str.length, 0);
	t.is(result.str, '');
});

test('string_variable_hex_encoded', (t) => {
	const buffer = Buffer.from('48656C6C6F20776F726C64210021212121', 'hex');
	const result = parse([
		binString('str', { nullTerminated: true, encoding: 'hex' }),
	], buffer);

	t.is(result.str.length, 24);
	t.is(result.str, '48656c6c6f20776f726c6421');
});

test('string_fixed_size_field', (t) => {
	const buffer = Buffer.from('0C48656C6C6F20776F726C6421212121', 'hex');
	const result = parse([
		uint8('length'),
		binString('str', { sizeField: 'length' }),
	], buffer);

	t.is(result.length, 12);
	t.is(result.str, 'Hello world!');
});

test('ASCIIInteger_variable_null_terminated', (t) => {
	const buffer = Buffer.from('313233342E353600', 'hex');
	const result = parse([
		asciiInteger('int', { nullTerminated: true }),
	], buffer);

	t.is(result.int, 1234);
});

test('ASCIIInteger_variable_null_terminated_negative', (t) => {
	const buffer = Buffer.from('2D313233342E353600', 'hex');
	const result = parse([
		asciiInteger('int', { nullTerminated: true }),
	], buffer);

	t.is(result.int, -1234);
});

test('ASCIIFloat_variable_null_terminated', (t) => {
	const buffer = Buffer.from('313233342E353600', 'hex');
	const result = parse([
		asciiFloat('float', { nullTerminated: true }),
	], buffer);

	t.is(result.float, 1234.56);
});

test('ASCIIFloat_variable_null_terminated_negative', (t) => {
	const buffer = Buffer.from('2D313233342E353600', 'hex');
	const result = parse([
		asciiFloat('float', { nullTerminated: true }),
	], buffer);

	t.is(result.float, -1234.56);
});
