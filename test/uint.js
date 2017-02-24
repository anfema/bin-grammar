const test = require('ava');
const { BinParser, UInt, UInt8, UInt16, UInt32 } = require('../index');

test('uint8_single', (t) => {
	const buffer = Buffer.from('ff', 'hex');
	const result = BinParser([
		UInt8('uint'),
	], buffer);

	t.is(result.uint, 255);
});

test('uint8_multiple_following', (t) => {
	const buffer = Buffer.from('ff0102', 'hex');
	const result = BinParser([
		UInt8('uint1'),
		UInt8('uint2'),
		UInt8('uint3'),
	], buffer);

	t.is(result.uint1, 255);
	t.is(result.uint2, 1);
	t.is(result.uint3, 2);
});

test('uint16be_single', (t) => {
	const buffer = Buffer.from('00ff', 'hex');
	const result = BinParser([
		UInt16('uint'),
	], buffer);

	t.is(result.uint, 255);
});

test('uint16le_single', (t) => {
	const buffer = Buffer.from('ff00', 'hex');
	const result = BinParser([
		UInt16('uint', { bigEndian: false }),
	], buffer);

	t.is(result.uint, 255);
});

test('uint16be_multiple_following', (t) => {
	const buffer = Buffer.from('00ff00011000', 'hex');
	const result = BinParser([
		UInt16('uint1'),
		UInt16('uint2'),
		UInt16('uint3'),
	], buffer);

	t.is(result.uint1, 255);
	t.is(result.uint2, 1);
	t.is(result.uint3, 4096);
});

test('uint16le_multiple_following', (t) => {
	const buffer = Buffer.from('ff0001000010', 'hex');
	const result = BinParser([
		UInt16('uint1', { bigEndian: false }),
		UInt16('uint2', { bigEndian: false }),
		UInt16('uint3', { bigEndian: false }),
	], buffer);

	t.is(result.uint1, 255);
	t.is(result.uint2, 1);
	t.is(result.uint3, 4096);
});

test('uint24be_single', (t) => {
	const buffer = Buffer.from('0100ff', 'hex');
	const result = BinParser([
		UInt('uint', { size: 3 }),
	], buffer);

	t.is(result.uint, 65791);
});

test('uint24le_single', (t) => {
	const buffer = Buffer.from('ff0001', 'hex');
	const result = BinParser([
		UInt('uint', { size: 3, bigEndian: false }),
	], buffer);

	t.is(result.uint, 65791);
});

test('uint32be_single', (t) => {
	const buffer = Buffer.from('000100ff', 'hex');
	const result = BinParser([
		UInt32('uint'),
	], buffer);

	t.is(result.uint, 65791);
});

test('uint32le_single', (t) => {
	const buffer = Buffer.from('ff000100', 'hex');
	const result = BinParser([
		UInt32('uint', { bigEndian: false }),
	], buffer);

	t.is(result.uint, 65791);
});
