const test = require('ava');
const { BinParser, Int8, Int16, Int32 } = require('../index');

test('int8_single', t => {
	const buffer = Buffer.from('01', 'hex');
	const result = BinParser([
		Int8('int')
	], buffer);

	t.is(result.int, 1);
});

test('int8_negative_single', t => {
	const buffer = Buffer.from('ff', 'hex');
	const result = BinParser([
		Int8('int')
	], buffer);

	t.is(result.int, -1);
});

test('int16_single', t => {
	const buffer = Buffer.from('0101', 'hex');
	const result = BinParser([
		Int16('int')
	], buffer);

	t.is(result.int, 257);
});

test('int16_negative_single', t => {
	const buffer = Buffer.from('8101', 'hex');
	const result = BinParser([
		Int16('int')
	], buffer);

	t.is(result.int, -32511);
});

test('int32_single', t => {
	const buffer = Buffer.from('538AF607', 'hex');
	const result = BinParser([
		Int32('int')
	], buffer);

	t.is(result.int, 1401615879);
});

test('int32_negative_single', t => {
	const buffer = Buffer.from('D38AF607', 'hex');
	const result = BinParser([
		Int32('int')
	], buffer);

	t.is(result.int, -745867769);
});
