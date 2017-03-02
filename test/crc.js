const test = require('ava');
const {
	parse, encode, template,
	binary,
	crc32, crc24, crc16,
	crc16CCITT, crc16Modbus,
	crc16Kermit, crc16XModem,
	crc8, crc81Wire, crc8XOR,
} = require('../index');

const hello = '48656C6C6F20576F726C64'; // Hello World

test('crc32_success', (t) => {
	const definition = [
		crc32('crc', [binary('data', { size: hello.length / 2 })])
	];
	const buffer = Buffer.from(hello + '4A17B156', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc32_fail', (t) => {
	const buffer = Buffer.from(hello + '4A17B157', 'hex');
	const result = parse([
		crc32('crc', [
			binary('data', { size: hello.length / 2 }),
		]),
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});


test('crc24_success', (t) => {
	const definition = [
		crc24('crc', [binary('data', { size: hello.length / 2 })])
	];
	const buffer = Buffer.from(hello + 'BA2CC4', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc24_fail', (t) => {
	const buffer = Buffer.from(hello + 'BA2CC5', 'hex');
	const result = parse([
		crc24('crc', [
			binary('data', { size: hello.length / 2 }),
		]),
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16_success', (t) => {
	const definition = [
		crc16('crc', [binary('data', { size: hello.length / 2 })])
	];
	const buffer = Buffer.from(hello + '3EEB', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc16_fail', (t) => {
	const buffer = Buffer.from(hello + '3EEA', 'hex');
	const result = parse([
		crc16('crc', [
			binary('data', { size: hello.length / 2 }),
		]),
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16ccitt_success', (t) => {
	const definition = [
		crc16CCITT('crc', [binary('data', { size: hello.length / 2 })])
	];
	const buffer = Buffer.from(hello + '4D25', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc16ccitt_fail', (t) => {
	const buffer = Buffer.from(hello + '4D24', 'hex');
	const result = parse([
		crc16CCITT('crc', [
			binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16modbus_success', (t) => {
	const definition = [
		crc16Modbus('crc', [binary('data', { size: hello.length / 2 })])
	]
	const buffer = Buffer.from(hello + 'DAED', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc16modbus_fail', (t) => {
	const buffer = Buffer.from(hello + 'DAEC', 'hex');
	const result = parse([
		crc16Modbus('crc', [
			binary('data', { size: hello.length / 2 }),
		]),
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16kermit_success', (t) => {
	const definition = [
		crc16Kermit('crc', [binary('data', { size: hello.length / 2 })])
	];
	const buffer = Buffer.from(hello + '23C9', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc16kermit_fail', (t) => {
	const buffer = Buffer.from(hello + '23C8', 'hex');
	const result = parse([
		crc16Kermit('crc', [
			binary('data', { size: hello.length / 2 }),
		]),
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16xmodem_success', (t) => {
	const definition = [
		crc16XModem('crc', [binary('data', { size: hello.length / 2 })])
	];
	const buffer = Buffer.from(hello + '992A', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc16xmodem_fail', (t) => {
	const buffer = Buffer.from(hello + '992B', 'hex');
	const result = parse([
		crc16XModem('crc', [
			binary('data', { size: hello.length / 2 }),
		]),
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc8_success', (t) => {
	const definition = [
		crc8('crc', [binary('data', { size: hello.length / 2 })])
	];
	const buffer = Buffer.from(hello + '25', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc8_fail', (t) => {
	const buffer = Buffer.from(hello + '26', 'hex');
	const result = parse([
		crc8('crc', [
			binary('data', { size: hello.length / 2 }),
		]),
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc81wire_success', (t) => {
	const definition = [
		crc81Wire('crc', [binary('data', { size: hello.length / 2 })])
	];
	const buffer = Buffer.from(hello + '1a', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc81wire_fail', (t) => {
	const buffer = Buffer.from(hello + '1b', 'hex');
	const result = parse([
		crc81Wire('crc', [
			binary('data', { size: hello.length / 2 }),
		]),
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc8xor_success', (t) => {
	const definition = [
		crc8XOR('crc', [binary('data', { size: hello.length / 2 })])
	];
	const buffer = Buffer.from(hello + '20', 'hex');
	const result = parse(definition, buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
});

test('crc8xor_fail', (t) => {
	const buffer = Buffer.from(hello + '21', 'hex');
	const result = parse([
		crc8XOR('crc', [
			binary('data', { size: hello.length / 2 }),
		]),
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});
