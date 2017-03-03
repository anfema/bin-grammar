const test = require('ava');
const { parse, encode, template, uint8, binString, selector } = require('../index');
const { compareTemplate } = require('../src/helper.js');

const definition = [
	uint8('switch'),
	selector('data', {
		field: 'switch',
		select: [
			{ match: 0, struct: [binString('zero', { nullTerminated: true })] },
			{ match: 1, struct: [uint8('fourtytwo'), binString('one', { nullTerminated: true })] },
		],
	}),
];


test('selector_1', (t) => {
	const buffer = Buffer.from('0048656C6C6F20576F726C642100', 'hex');
	const result = parse(definition, buffer);

	t.is(result.switch, 0);
	t.is(result.data.zero, 'Hello World!');

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { switch: null, data: null }), true);
});

test('selector_2', (t) => {
	const buffer = Buffer.from('014248656C6C6F20576F726C642100', 'hex');
	const result = parse(definition, buffer);

	t.is(result.switch, 1);
	t.is(result.data.fourtytwo, 0x42);
	t.is(result.data.one, 'Hello World!');

	const encoded = encode(definition, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(definition), { switch: null, data: null }), true);
});

test('selector_flatten', (t) => {
	const def = [
		uint8('switch'),
		selector('data', {
			field: 'switch',
			flatten: true,
			select: [
				{ match: 0, struct: [binString('zero', { nullTerminated: true })] },
				{ match: 1, struct: [uint8('fourtytwo'), binString('one', { nullTerminated: true })] },
			],
		}),
	];
	const buffer = Buffer.from('0048656C6C6F20576F726C642100', 'hex');
	const result = parse(def, buffer);

	t.is(result.switch, 0);
	t.is(result.data, 'Hello World!');

	const encoded = encode(def, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(def), { switch: null, data: null }), true);
});

test('selector_size_field', (t) => {
	const def = [
		uint8('switch'),
		uint8('size'),
		selector('data', {
			sizeField: 'size',
			field: 'switch',
			select: [
				{ match: 0, struct: [binString('zero', { nullTerminated: true })] },
				{ match: 1, struct: [uint8('fourtytwo'), binString('one', { nullTerminated: true })] },
			],
		}),
	];
	const buffer = Buffer.from('010e4248656C6C6F20576F726C642100', 'hex');
	const result = parse(def, buffer);

	t.is(result.switch, 1);
	t.is(result.size, 14);
	t.is(result.data.fourtytwo, 0x42);
	t.is(result.data.one, 'Hello World!');

	result.size = 0; // zero size field as it should be set by encoder
	const encoded = encode(def, result);

	t.is(encoded.compare(buffer), 0);
	t.is(compareTemplate(template(def), { switch: null, size: null, data: null }), true);
});
