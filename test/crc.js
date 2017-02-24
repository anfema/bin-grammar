const test = require('ava');
const {
	BinParser, Binary,
	CRC32, CRC24, CRC16,
	CRC16_CCITT, CRC16_Modbus,
	CRC16_Kermit, CRC16_XModem,
	CRC8, CRC8_1Wire, CRC8_XOR,
} = require('../index');

const hello = '48656C6C6F20576F726C64'; // Hello World

test('crc32_success', (t) => {
	const buffer = Buffer.from(hello + '4A17B156', 'hex');
	const result = BinParser([
		CRC32('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc32_fail', (t) => {
	const buffer = Buffer.from(hello + '4A17B157', 'hex');
	const result = BinParser([
		CRC32('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});


test('crc24_success', (t) => {
	const buffer = Buffer.from(hello + 'BA2CC4', 'hex');
	const result = BinParser([
		CRC24('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc24_fail', (t) => {
	const buffer = Buffer.from(hello + 'BA2CC5', 'hex');
	const result = BinParser([
		CRC24('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16_success', (t) => {
	const buffer = Buffer.from(hello + '3EEB', 'hex');
	const result = BinParser([
		CRC16('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc16_fail', (t) => {
	const buffer = Buffer.from(hello + '3EEA', 'hex');
	const result = BinParser([
		CRC16('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16ccitt_success', (t) => {
	const buffer = Buffer.from(hello + '4D25', 'hex');
	const result = BinParser([
		CRC16_CCITT('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc16ccitt_fail', (t) => {
	const buffer = Buffer.from(hello + '4D24', 'hex');
	const result = BinParser([
		CRC16_CCITT('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16modbus_success', (t) => {
	const buffer = Buffer.from(hello + 'DAED', 'hex');
	const result = BinParser([
		CRC16_Modbus('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc16modbus_fail', (t) => {
	const buffer = Buffer.from(hello + 'DAEC', 'hex');
	const result = BinParser([
		CRC16_Modbus('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16kermit_success', (t) => {
	const buffer = Buffer.from(hello + '23C9', 'hex');
	const result = BinParser([
		CRC16_Kermit('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc16kermit_fail', (t) => {
	const buffer = Buffer.from(hello + '23C8', 'hex');
	const result = BinParser([
		CRC16_Kermit('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc16xmodem_success', (t) => {
	const buffer = Buffer.from(hello + '992A', 'hex');
	const result = BinParser([
		CRC16_XModem('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc16xmodem_fail', (t) => {
	const buffer = Buffer.from(hello + '992B', 'hex');
	const result = BinParser([
		CRC16_XModem('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc8_success', (t) => {
	const buffer = Buffer.from(hello + '25', 'hex');
	const result = BinParser([
		CRC8('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc8_fail', (t) => {
	const buffer = Buffer.from(hello + '26', 'hex');
	const result = BinParser([
		CRC8('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc81wire_success', (t) => {
	const buffer = Buffer.from(hello + '1a', 'hex');
	const result = BinParser([
		CRC8_1Wire('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc81wire_fail', (t) => {
	const buffer = Buffer.from(hello + '1b', 'hex');
	const result = BinParser([
		CRC8_1Wire('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});

test('crc8xor_success', (t) => {
	const buffer = Buffer.from(hello + '20', 'hex');
	const result = BinParser([
		CRC8_XOR('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, true);
});

test('crc8xor_fail', (t) => {
	const buffer = Buffer.from(hello + '21', 'hex');
	const result = BinParser([
		CRC8_XOR('crc', [
			Binary('data', { size: hello.length / 2 }),
		])
	], buffer);

	t.is(result.data.length, hello.length / 2);
	t.is(result.crc, false);
});
