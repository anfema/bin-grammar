const test = require('ava');
const { BinParser, BitMask } = require('../index');

test('bitmask_no_bits', (t) => {
	const buffer = Buffer.from('00', 'hex');
	const result = BinParser([
		BitMask('mask', {
			bitfield: {
				bit0: 0,
				bit1: 1,
				bit2: 2,
				bit3: 3,
				bit4: 4,
				bit5: 5,
				bit6: 6,
				bit7: 7,
			},
		}),
	], buffer);

	t.is(result.mask.length, 0);
});

test('bitmask_one_bit', (t) => {
	const buffer = Buffer.from('01', 'hex');
	const result = BinParser([
		BitMask('mask', {
			bitfield: {
				bit0: 0,
				bit1: 1,
				bit2: 2,
				bit3: 3,
				bit4: 4,
				bit5: 5,
				bit6: 6,
				bit7: 7,
			},
		}),
	], buffer);

	t.is(result.mask.length, 1);
	t.is(result.mask[0], 'bit7');
});

test('bitmask_all_bits', (t) => {
	const buffer = Buffer.from('ff', 'hex');
	const result = BinParser([
		BitMask('mask', {
			bitfield: {
				bit0: 0,
				bit1: 1,
				bit2: 2,
				bit3: 3,
				bit4: 4,
				bit5: 5,
				bit6: 6,
				bit7: 7,
			},
		}),
	], buffer);

	t.is(result.mask.length, 8);
});
