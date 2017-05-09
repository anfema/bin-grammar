const test = require('ava');
const { parse, encode, binString, uint8, asciiFloat, asciiInteger } = require('../index');

test('string_fixed', (t) => {
	const definition = [binString('str', { size: 12 })];
	const buffer = Buffer.from('48656C6C6F20776F726C6421212121', 'hex');
	const result = parse(definition, buffer);

	t.is(result.str, 'Hello world!');

	const encoded = encode(definition, result);

	// padding is removed on re-encode
	t.is(encoded.compare(buffer.slice(0, result.str.length)), 0);
});

test('string_fixed_null_terminated', (t) => {
	const definition = [binString('str', { size: 16, nullTerminated: true })];
	const buffer = Buffer.from('48656C6C6F20776F726C64210021212121', 'hex');
	const result = parse(definition, buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');

	const encoded = encode(definition, result);

	// special case as the original buffer had characters after the string
	t.is(encoded.compare(Buffer.from('48656C6C6F20776F726C642100000000', 'hex')), 0);
});

test('string_variable_null_terminated', (t) => {
	const definition = [binString('str', { nullTerminated: true })];
	const buffer = Buffer.from('48656C6C6F20776F726C64210021212121', 'hex');
	const result = parse(definition, buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');

	const encoded = encode(definition, result);

	// special case as the original buffer had characters after the string
	t.is(encoded.compare(buffer.slice(0, result.str.length + 1)), 0);
});

test('string_variable_null_terminated_following', (t) => {
	const definition = [
		binString('str1', { nullTerminated: true }),
		binString('str2', { nullTerminated: true }),
	];
	const buffer = Buffer.from('48656C6C6F20776F726C6421002121212100', 'hex');
	const result = parse(definition, buffer);

	t.is(result.str1.length, 12);
	t.is(result.str1, 'Hello world!');
	t.is(result.str2.length, 4);
	t.is(result.str2, '!!!!');

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('string_fixed_size_prefix', (t) => {
	const definition = [binString('str', { sizePrefixed: true, sizePrefixLength: 1 })];
	const buffer = Buffer.from('0C48656C6C6F20776F726C6421212121', 'hex');
	const result = parse(definition, buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');

	const encoded = encode(definition, result);

	// padding is removed on re-encode
	t.is(encoded.compare(buffer.slice(0, result.str.length + 1)), 0);
});

test('string_fixed_size_prefix_null_terminated', (t) => {
	const definition = [binString('str', { sizePrefixed: true, sizePrefixLength: 1, nullTerminated: true })];
	const buffer = Buffer.from('0F48656C6C6F20776F726C64210021212121', 'hex');
	const result = parse(definition, buffer);

	t.is(result.str.length, 12);
	t.is(result.str, 'Hello world!');

	const encoded = encode(definition, result);

	// re-encode mangles the padded buffer
	t.is(encoded.compare(Buffer.from('0D48656C6C6F20776F726C642100', 'hex')), 0);
});

test('string_fixed_size_prefix_empty', (t) => {
	const definition = [binString('str', { sizePrefixed: true, sizePrefixLength: 1, nullTerminated: true })];
	const buffer = Buffer.from('0048656C6C6F20776F726C64210021212121', 'hex');
	const result = parse(definition, buffer);

	t.is(result.str.length, 0);
	t.is(result.str, '');

	const encoded = encode(definition, result);

	// padding is removed on re-encode
	t.is(encoded.compare(Buffer.from('0100', 'hex')), 0);
});

test('string_variable_empty', (t) => {
	const definition = [binString('str', { nullTerminated: true })];
	const buffer = Buffer.from('0048656C6C6F20776F726C64210021212121', 'hex');
	const result = parse(definition, buffer);

	t.is(result.str.length, 0);
	t.is(result.str, '');

	const encoded = encode(definition, result);

	// padding is removed on re-encode
	t.is(encoded.compare(Buffer.alloc(1)), 0);
});

test('string_variable_hex_encoded', (t) => {
	const definition = [binString('str', { nullTerminated: true, encoding: 'hex' })];
	const buffer = Buffer.from('48656c6c6f20776f726c64210021212121', 'hex');
	const result = parse(definition, buffer);

	t.is(result.str.length, 24);
	t.is(result.str, '48656c6c6f20776f726c6421');

	const encoded = encode(definition, result);

	// padding is removed on re-encode
	t.is(encoded.compare(Buffer.from('48656c6c6f20776f726c642100', 'hex')), 0);
});

test('string_fixed_size_field', (t) => {
	const definition = [
		uint8('length'),
		binString('str', { sizeField: 'length' }),
	];
	const buffer = Buffer.from('0C48656C6C6F20776F726C6421212121', 'hex');
	const result = parse(definition, buffer);

	t.is(result.length, 12);
	t.is(result.str, 'Hello world!');

	const encoded = encode(definition, result);

	// padding is removed on re-encode
	t.is(encoded.compare(Buffer.from('0C48656C6C6F20776F726C6421', 'hex')), 0);
});

test('ASCIIInteger_variable_null_terminated', (t) => {
	const definition = [asciiInteger('int', { nullTerminated: true })];
	const buffer = Buffer.from('313233342E353600', 'hex');
	const result = parse(definition, buffer);

	t.is(result.int, 1234);

	const encoded = encode(definition, result);

	t.is(encoded.compare(Buffer.from('3132333400', 'hex')), 0);
});

test('ASCIIInteger_variable_null_terminated_negative', (t) => {
	const definition = [asciiInteger('int', { nullTerminated: true })];
	const buffer = Buffer.from('2D313233342E353600', 'hex');
	const result = parse(definition, buffer);

	t.is(result.int, -1234);

	const encoded = encode(definition, result);

	t.is(encoded.compare(Buffer.from('2D3132333400', 'hex')), 0);
});

test('ASCIIFloat_variable_null_terminated', (t) => {
	const definition = [asciiFloat('float', { nullTerminated: true })];
	const buffer = Buffer.from('313233342E353600', 'hex');
	const result = parse(definition, buffer);

	t.is(result.float, 1234.56);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('ASCIIFloat_variable_null_terminated_negative', (t) => {
	const definition = [asciiFloat('float', { nullTerminated: true })];
	const buffer = Buffer.from('2D313233342E353600', 'hex');
	const result = parse(definition, buffer);

	t.is(result.float, -1234.56);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('ASCIIInteger_variable_null_terminated_base16', (t) => {
	const definition = [asciiInteger('int', { base: 16, nullTerminated: true })];
	const buffer = Buffer.from('323000', 'hex');
	const result = parse(definition, buffer);

	t.is(result.int, 32);

	const encoded = encode(definition, result);

	t.is(encoded.compare(Buffer.from('323000', 'hex')), 0);
});
