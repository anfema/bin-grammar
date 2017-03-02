const test = require('ava');
const { parse, encode, template, bitMask } = require('../index');
const { compareTemplate } = require('../src/helper.js');

test('bitmask_no_bits', (t) => {
	const definition = [
		bitMask('mask', {
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
	];
	const buffer = Buffer.from('00', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.mask.length, 0);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { mask: null }), true);
});

test('bitmask_one_bit', (t) => {
	const definition = [
		bitMask('mask', {
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
	];
	const buffer = Buffer.from('01', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.mask.length, 1);
	t.is(result.mask[0], 'bit7');
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { mask: null }), true);
});

test('bitmask_all_bits', (t) => {
	const definition = [
		bitMask('mask', {
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
	];
	const buffer = Buffer.from('ff', 'hex');
	const result = parse(definition, buffer);
	const encoded = encode(definition, result);

	t.is(result.mask.length, 8);
	t.is(encoded.compare(buffer), 0);

	t.is(compareTemplate(template(definition), { mask: null }), true);
});
