const test = require('ava');
const { BinParser, BitStruct, BitFlag, BitInt, BitUInt, BitEnum, BitBitMask } = require('../index');

test('bit_flags', (t) => {
	const buffer = Buffer.from('05', 'hex');
	const result = BinParser([
		BitStruct('bit', {
			size: 1,
			elements: [
				BitFlag('bit1'),
				BitFlag('bit2'),
				BitFlag('bit3'),
				BitFlag('bit4'),
				BitFlag('bit5'),
				BitFlag('bit6'),
				BitFlag('bit7'),
				BitFlag('bit8'),
			],
		}),
	], buffer);

	t.is(result.bit.bit1, false);
	t.is(result.bit.bit2, false);
	t.is(result.bit.bit3, false);
	t.is(result.bit.bit4, false);
	t.is(result.bit.bit5, false);
	t.is(result.bit.bit6, true);
	t.is(result.bit.bit7, false);
	t.is(result.bit.bit8, true);
});

test('bit_int', (t) => {
	const buffer = Buffer.from('5f', 'hex');
	const result = BinParser([
		BitStruct('bit', {
			size: 1,
			elements: [
				BitInt('int1', { size: 4 }),
				BitInt('int2', { size: 4 }),
			],
		}),
	], buffer);

	t.is(result.bit.int1, 5);
	t.is(result.bit.int2, -1);
});

test('bit_uint', (t) => {
	const buffer = Buffer.from('5f', 'hex');
	const result = BinParser([
		BitStruct('bit', {
			size: 1,
			elements: [
				BitUInt('int1', { size: 4 }),
				BitUInt('int2', { size: 4 }),
			],
		}),
	], buffer);

	t.is(result.bit.int1, 5);
	t.is(result.bit.int2, 15);
});

test('bit_enum', (t) => {
	const buffer = Buffer.from('5f', 'hex');
	const result = BinParser([
		BitStruct('bit', {
			size: 1,
			elements: [
				BitUInt('int1', { size: 4 }),
				BitEnum('enum', {
					size: 4,
					choices: {
						nothing: 0,
						all: 15,
					},
				}),
			],
		}),
	], buffer);

	t.is(result.bit.int1, 5);
	t.is(result.bit.enum, 'all');
});

test('bit_bitmask', (t) => {
	const buffer = Buffer.from('53', 'hex');
	const result = BinParser([
		BitStruct('bit', {
			size: 1,
			elements: [
				BitUInt('int1', { size: 4 }),
				BitBitMask('mask', {
					size: 4,
					bitfield: {
						bit0: 0,
						bit1: 1,
						bit2: 2,
						bit3: 3,
					},
				}),
			],
		}),
	], buffer);

	t.is(result.bit.int1, 5);
	t.is(result.bit.mask.length, 2);
	t.is(result.bit.mask[0], 'bit2');
	t.is(result.bit.mask[1], 'bit3');
});


test('bit_integration', (t) => {
	const buffer = Buffer.from('53f0', 'hex');
	const result = BinParser([
		BitStruct('bit', {
			size: 2,
			elements: [
				BitUInt('int1', { size: 4 }),
				BitBitMask('mask', {
					size: 3,
					bitfield: {
						bit0: 0,
						bit1: 1,
						bit2: 2,
					},
				}),
				BitFlag('flag'),
				BitEnum('enum', {
					size: 2,
					choices: {
						nothing: 0,
						all: 3,
					},
				}),
				BitInt('int2', { size: 6 }),
			],
		}),
	], buffer);

	t.is(result.bit.int1, 5);
	t.is(result.bit.mask.length, 1);
	t.is(result.bit.mask[0], 'bit2');
	t.is(result.bit.flag, true);
	t.is(result.bit.enum, 'all');
	t.is(result.bit.int2, -16);
});
