const test = require('ava');
const { BinParser, Enum } = require('../index');

test('enum_single', t => {
	const buffer = Buffer.from('02', 'hex');
	const result = BinParser([
		Enum('enum', {
			choices: {
				one: 1,
				two: 2,
			},
		})
	], buffer);

	t.is(result.enum, 'two');
});

test('enum_null', t => {
	const buffer = Buffer.from('03', 'hex');
	const result = BinParser([
		Enum('enum', {
			choices: {
				one: 1,
				two: 2,
			},
		})
	], buffer);

	t.is(result.enum, null);
});
