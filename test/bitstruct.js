const test = require('ava');
const { parse, bitStruct, bitFlag, bitInt, bitUInt, bitEnum, bitBitMask } = require('../index');

test('bit_flags', (t) => {
	const buffer = Buffer.from('05', 'hex');
	const result = parse([
		bitStruct('bit', {
			size: 1,
			elements: [
				bitFlag('bit1'),
				bitFlag('bit2'),
				bitFlag('bit3'),
				bitFlag('bit4'),
				bitFlag('bit5'),
				bitFlag('bit6'),
				bitFlag('bit7'),
				bitFlag('bit8'),
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
	const result = parse([
		bitStruct('bit', {
			size: 1,
			elements: [
				bitInt('int1', { size: 4 }),
				bitInt('int2', { size: 4 }),
			],
		}),
	], buffer);

	t.is(result.bit.int1, 5);
	t.is(result.bit.int2, -1);
});

test('bit_uint', (t) => {
	const buffer = Buffer.from('5f', 'hex');
	const result = parse([
		bitStruct('bit', {
			size: 1,
			elements: [
				bitUInt('int1', { size: 4 }),
				bitUInt('int2', { size: 4 }),
			],
		}),
	], buffer);

	t.is(result.bit.int1, 5);
	t.is(result.bit.int2, 15);
});

test('bit_enum', (t) => {
	const buffer = Buffer.from('5f', 'hex');
	const result = parse([
		bitStruct('bit', {
			size: 1,
			elements: [
				bitUInt('int1', { size: 4 }),
				bitEnum('enum', {
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
	const result = parse([
		bitStruct('bit', {
			size: 1,
			elements: [
				bitUInt('int1', { size: 4 }),
				bitBitMask('mask', {
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
	const result = parse([
		bitStruct('bit', {
			size: 2,
			elements: [
				bitUInt('int1', { size: 4 }),
				bitBitMask('mask', {
					size: 3,
					bitfield: {
						bit0: 0,
						bit1: 1,
						bit2: 2,
					},
				}),
				bitFlag('flag'),
				bitEnum('enum', {
					size: 2,
					choices: {
						nothing: 0,
						all: 3,
					},
				}),
				bitInt('int2', { size: 6 }),
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
