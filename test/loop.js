const test = require('ava');
const { parse, encode, template, binary, bcd, uint16, uint8, loop } = require('../index');

// test.todo('Loop tests');

const bufeq = (b1, b2) => b1.compare(b2) === 0;

// DECODER tests
test('parse loop indefinite', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
		}),
	];
	const buffer = Buffer.from([0x01, 0x02, 0x03, 0x04]);
	const parsed = parse(definition, buffer);

	const buffer2 = Buffer.from([
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const parsed2 = parse(definition, buffer2);

	t.is(parsed.myArray.length, 4);
	t.is(parsed.myArray[0].myField, buffer[0]);
	t.is(parsed.myArray[1].myField, buffer[1]);
	t.is(parsed.myArray[2].myField, buffer[2]);
	t.is(parsed.myArray[3].myField, buffer[3]);

	t.is(parsed2.myArray.length, 8);
	t.is(parsed2.myArray[0].myField, buffer2[0]);
	t.is(parsed2.myArray[1].myField, buffer2[1]);
	t.is(parsed2.myArray[2].myField, buffer2[2]);
	t.is(parsed2.myArray[3].myField, buffer2[3]);
	t.is(parsed2.myArray[4].myField, buffer2[4]);
	t.is(parsed2.myArray[5].myField, buffer2[5]);
	t.is(parsed2.myArray[6].myField, buffer2[6]);
	t.is(parsed2.myArray[7].myField, buffer2[7]);
});

test('parse loop definite constant', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitions: 4,
		}),
	];
	const buffer = Buffer.from([0x01, 0x02, 0x03, 0x04]);
	const parsed = parse(definition, buffer);

	const buffer2 = Buffer.from([
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const parsed2 = parse(definition, buffer2);

	t.is(parsed.myArray.length, 4);
	t.is(parsed.myArray[0].myField, buffer[0]);
	t.is(parsed.myArray[1].myField, buffer[1]);
	t.is(parsed.myArray[2].myField, buffer[2]);
	t.is(parsed.myArray[3].myField, buffer[3]);

	t.is(parsed2.myArray.length, 4);
	t.is(parsed2.myArray[0].myField, buffer2[0]);
	t.is(parsed2.myArray[1].myField, buffer2[1]);
	t.is(parsed2.myArray[2].myField, buffer2[2]);
	t.is(parsed2.myArray[3].myField, buffer2[3]);
});

test('parse loop definite expression', (t) => {
	const definition = [
		uint8('numberOfIterations'),
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitionField: 'numberOfIterations',
		}),
	];
	const buffer = Buffer.from([
		0x04, // number of iterations
		0x01, 0x02, 0x03, 0x04
	]);

	const parsed = parse(definition, buffer);

	const buffer2 = Buffer.from([
		0x08, // number of iterations
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const parsed2 = parse(definition, buffer2);

	t.is(parsed.myArray.length, 4);
	t.is(parsed.myArray[0].myField, buffer[0 + 1]);
	t.is(parsed.myArray[1].myField, buffer[1 + 1]);
	t.is(parsed.myArray[2].myField, buffer[2 + 1]);
	t.is(parsed.myArray[3].myField, buffer[3 + 1]);

	t.is(parsed2.myArray.length, 8);
	t.is(parsed2.myArray[0].myField, buffer2[0 + 1]);
	t.is(parsed2.myArray[1].myField, buffer2[1 + 1]);
	t.is(parsed2.myArray[2].myField, buffer2[2 + 1]);
	t.is(parsed2.myArray[3].myField, buffer2[3 + 1]);
	t.is(parsed2.myArray[4].myField, buffer2[4 + 1]);
	t.is(parsed2.myArray[5].myField, buffer2[5 + 1]);
	t.is(parsed2.myArray[6].myField, buffer2[6 + 1]);
	t.is(parsed2.myArray[7].myField, buffer2[7 + 1]);
});

test('parse loop definite prefix uint8', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitionsPrefixed: true,
			repetitionsPrefixLength: 1, // BYTES
		}),
	];
	const buffer = Buffer.from([
		0x04, // number of iterations
		0x01, 0x02, 0x03, 0x04
	]);

	const parsed = parse(definition, buffer);

	const buffer2 = Buffer.from([
		0x08, // number of iterations
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const parsed2 = parse(definition, buffer2);

	t.is(parsed.myArray.length, 4);
	t.is(parsed.myArray[0].myField, buffer[0 + 1]);
	t.is(parsed.myArray[1].myField, buffer[1 + 1]);
	t.is(parsed.myArray[2].myField, buffer[2 + 1]);
	t.is(parsed.myArray[3].myField, buffer[3 + 1]);

	t.is(parsed2.myArray.length, 8);
	t.is(parsed2.myArray[0].myField, buffer2[0 + 1]);
	t.is(parsed2.myArray[1].myField, buffer2[1 + 1]);
	t.is(parsed2.myArray[2].myField, buffer2[2 + 1]);
	t.is(parsed2.myArray[3].myField, buffer2[3 + 1]);
	t.is(parsed2.myArray[4].myField, buffer2[4 + 1]);
	t.is(parsed2.myArray[5].myField, buffer2[5 + 1]);
	t.is(parsed2.myArray[6].myField, buffer2[6 + 1]);
	t.is(parsed2.myArray[7].myField, buffer2[7 + 1]);
});

test('parse loop definite prefix uint16be', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitionsPrefixed: true,
			repetitionsPrefixLength: 2, // BYTES
			repetitionsBigEndian: true,
		}),
	];
	const buffer = Buffer.from([
		0x00, 0x04, // number of iterations
		0x01, 0x02, 0x03, 0x04
	]);

	const parsed = parse(definition, buffer);

	const buffer2 = Buffer.from([
		0x00, 0x08, // number of iterations
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const parsed2 = parse(definition, buffer2);

	t.is(parsed.myArray.length, 4);
	t.is(parsed.myArray[0].myField, buffer[0 + 2]);
	t.is(parsed.myArray[1].myField, buffer[1 + 2]);
	t.is(parsed.myArray[2].myField, buffer[2 + 2]);
	t.is(parsed.myArray[3].myField, buffer[3 + 2]);

	t.is(parsed2.myArray.length, 8);
	t.is(parsed2.myArray[0].myField, buffer2[0 + 2]);
	t.is(parsed2.myArray[1].myField, buffer2[1 + 2]);
	t.is(parsed2.myArray[2].myField, buffer2[2 + 2]);
	t.is(parsed2.myArray[3].myField, buffer2[3 + 2]);
	t.is(parsed2.myArray[4].myField, buffer2[4 + 2]);
	t.is(parsed2.myArray[5].myField, buffer2[5 + 2]);
	t.is(parsed2.myArray[6].myField, buffer2[6 + 2]);
	t.is(parsed2.myArray[7].myField, buffer2[7 + 2]);
});

test('parse loop definite prefix uint16le', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitionsPrefixed: true,
			repetitionsPrefixLength: 2, // BYTES
			repetitionsBigEndian: false,
		}),
	];
	const buffer = Buffer.from([
		0x04, 0x00, // number of iterations
		0x01, 0x02, 0x03, 0x04
	]);

	const parsed = parse(definition, buffer);

	const buffer2 = Buffer.from([
		0x08, 0x00, // number of iterations
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const parsed2 = parse(definition, buffer2);

	t.is(parsed.myArray.length, 4);
	t.is(parsed.myArray[0].myField, buffer[0 + 2]);
	t.is(parsed.myArray[1].myField, buffer[1 + 2]);
	t.is(parsed.myArray[2].myField, buffer[2 + 2]);
	t.is(parsed.myArray[3].myField, buffer[3 + 2]);

	t.is(parsed2.myArray.length, 8);
	t.is(parsed2.myArray[0].myField, buffer2[0 + 2]);
	t.is(parsed2.myArray[1].myField, buffer2[1 + 2]);
	t.is(parsed2.myArray[2].myField, buffer2[2 + 2]);
	t.is(parsed2.myArray[3].myField, buffer2[3 + 2]);
	t.is(parsed2.myArray[4].myField, buffer2[4 + 2]);
	t.is(parsed2.myArray[5].myField, buffer2[5 + 2]);
	t.is(parsed2.myArray[6].myField, buffer2[6 + 2]);
	t.is(parsed2.myArray[7].myField, buffer2[7 + 2]);
});

test('parse loop index', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				binary('myField', {
					sizeField: '_index',
					sizeFieldTransform: i => i + 1,
				}),
			],
		}),
	];
	const buffer = Buffer.from([
		0x01,                   // read 0+1 bytes
		0x02, 0x12,             // read 1+1 bytes
		0x03, 0x13, 0x23,       // read 2+1 bytes
		0x04, 0x14, 0x24, 0x34, // read 3+1 bytes
	]);

	const parsed = parse(definition, buffer);

	console.log(parsed);

	t.is(parsed.myArray.length, 4);
	t.is(parsed.myArray[0].myField.compare(buffer.slice(0, 1)), 0);
	t.is(parsed.myArray[1].myField.compare(buffer.slice(1, 3)), 0);
	t.is(parsed.myArray[2].myField.compare(buffer.slice(3, 6)), 0);
	t.is(parsed.myArray[3].myField.compare(buffer.slice(6)), 0);
});

test('parse loop context', (t) => {
	const definition = [
		loop("mySizes", {
			struct: [
				uint8("mySize"),
			],
			repetitions: 4,
		}),
		loop("myArray", {
			struct: [
				binary('myField', {
					sizeField: '_context',
				}),
			],
			contextField: "mySizes",
			contextFieldTransform: (ctx, idx) => ctx[idx].mySize,
		}),
	];
	const buffer = Buffer.from([
		// first here's the table of sizes...
		0x02, // first blob is 2 bytes
		0x01, // second blob is 1 byte
		0x04, // third blob is 4 bytes
		0x03, // fourth blob is 3 bytes
		// ...and here's the data
		0x02, 0x12,             // read 2 bytes
		0x01,                   // read 1 byte
		0x04, 0x14, 0x24, 0x34, // read 4 bytes
		0x03, 0x13, 0x23,       // read 3 bytes
	]);

	const parsed = parse(definition, buffer);

	t.is(parsed.myArray.length, 4);
	t.is(parsed.myArray[0].myField.compare(Buffer.from([0x02, 0x12])), 0);
	t.is(parsed.myArray[1].myField.compare(Buffer.from([0x01])), 0);
	t.is(parsed.myArray[2].myField.compare(Buffer.from([0x04, 0x14, 0x24, 0x34])), 0);
	t.is(parsed.myArray[3].myField.compare(Buffer.from([0x03, 0x13, 0x23])), 0);
});

// ENCODER tests
test('gen loop indefinite', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
		}),
	];

	const obj = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
		]
	};

	const buffer = Buffer.from([0x01, 0x02, 0x03, 0x04]);
	const encoded = encode(definition, obj);

	const obj2 = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
			{ myField: 0x05 },
			{ myField: 0x06 },
			{ myField: 0x07 },
			{ myField: 0x08 },
		]
	};

	const buffer2 = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);
	const encoded2 = encode(definition, obj2);

	t.truthy(bufeq(encoded, buffer));
	t.truthy(bufeq(encoded2, buffer2));
});

test('gen loop definite constant', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitions: 4,
		}),
	];

	const obj = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
		]
	};

	const buffer = Buffer.from([0x01, 0x02, 0x03, 0x04]);
	const encoded = encode(definition, obj);

	const obj2 = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
			{ myField: 0xf1 },
			{ myField: 0xf2 },
			{ myField: 0xf3 },
			{ myField: 0xf4 },
		]
	};

	const buffer2 = Buffer.from([
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const encoded2 = encode(definition, obj2);

	t.truthy(bufeq(encoded, buffer));
	t.truthy(bufeq(encoded2, buffer2));
});


test('gen loop definite expression', (t) => {
	const definition = [
		uint8('numberOfIterations'),
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitionField: 'numberOfIterations',
		}),
	];

	const obj = {
		numberOfIterations: 4,
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
		]
	};

	const buffer = Buffer.from([
		0x04,
		0x01, 0x02, 0x03, 0x04
	]);

	const encoded = encode(definition, obj);

	const obj2 = {
		numberOfIterations: 8,
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
			{ myField: 0xf1 },
			{ myField: 0xf2 },
			{ myField: 0xf3 },
			{ myField: 0xf4 },
		]
	};

	const buffer2 = Buffer.from([
		0x08,
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const encoded2 = encode(definition, obj2);

	t.truthy(bufeq(encoded, buffer));
	t.truthy(bufeq(encoded2, buffer2));
});

test('gen loop definite prefix uint8', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitionsPrefixed: true,
			repetitionsPrefixLength: 1, // BYTES
		}),
	];

	const obj = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
		]
	};

	const buffer = Buffer.from([
		0x04,
		0x01, 0x02, 0x03, 0x04
	]);

	const encoded = encode(definition, obj);

	const obj2 = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
			{ myField: 0xf1 },
			{ myField: 0xf2 },
			{ myField: 0xf3 },
			{ myField: 0xf4 },
		]
	};

	const buffer2 = Buffer.from([
		0x08,
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const encoded2 = encode(definition, obj2);

	t.truthy(bufeq(encoded, buffer));
	t.truthy(bufeq(encoded2, buffer2));
});

test('gen loop definite prefix uint16be', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitionsPrefixed: true,
			repetitionsPrefixLength: 2, // BYTES
			repetitionsBigEndian: true,
		}),
	];

	const obj = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
		]
	};

	const buffer = Buffer.from([
		0x00, 0x04,
		0x01, 0x02, 0x03, 0x04
	]);

	const encoded = encode(definition, obj);

	const obj2 = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
			{ myField: 0xf1 },
			{ myField: 0xf2 },
			{ myField: 0xf3 },
			{ myField: 0xf4 },
		]
	};

	const buffer2 = Buffer.from([
		0x00, 0x08,
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const encoded2 = encode(definition, obj2);

	t.truthy(bufeq(encoded, buffer));
	t.truthy(bufeq(encoded2, buffer2));
});

test('gen loop definite prefix uint16le', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				uint8('myField'),
			],
			repetitionsPrefixed: true,
			repetitionsPrefixLength: 2, // BYTES
			repetitionsBigEndian: false,
		}),
	];

	const obj = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
		]
	};

	const buffer = Buffer.from([
		0x04, 0x00,
		0x01, 0x02, 0x03, 0x04
	]);

	const encoded = encode(definition, obj);

	const obj2 = {
		myArray: [
			{ myField: 0x01 },
			{ myField: 0x02 },
			{ myField: 0x03 },
			{ myField: 0x04 },
			{ myField: 0xf1 },
			{ myField: 0xf2 },
			{ myField: 0xf3 },
			{ myField: 0xf4 },
		]
	};

	const buffer2 = Buffer.from([
		0x08, 0x00,
		0x01, 0x02, 0x03, 0x04,
		0xf1, 0xf2, 0xf3, 0xf4,
	]);
	const encoded2 = encode(definition, obj2);

	t.truthy(bufeq(encoded, buffer));
	t.truthy(bufeq(encoded2, buffer2));
});

test('gen loop index', (t) => {
	const definition = [
		loop("myArray", {
			struct: [
				binary('myField', {
					sizeField: '_index',
					sizeFieldTransform: i => i + 1,
					sizeFieldReverseTransform: i => i + 1,
				}),
			],
		}),
	];

	const obj = {
		myArray: [
			{ myField: Buffer.from([0x01]) },
			{ myField: Buffer.from([0x02, 0x12]) },
			{ myField: Buffer.from([0x03, 0x13, 0x23]) },
			{ myField: Buffer.from([0x04, 0x14, 0x24, 0x34]) },
		]
	};

	const buffer = Buffer.from([
		0x01,                   // read 0+1 bytes
		0x02, 0x12,             // read 1+1 bytes
		0x03, 0x13, 0x23,       // read 2+1 bytes
		0x04, 0x14, 0x24, 0x34, // read 3+1 bytes
	]);

	const encoded = encode(definition, obj);

	t.truthy(bufeq(encoded, buffer));
});

test('gen loop context', (t) => {
	const definition = [
		loop("mySizes", {
			struct: [
				uint8("mySize"),
			],
			repetitions: 4,
		}),
		loop("myArray", {
			struct: [
				binary('myField', {
					sizeField: '_context',
				}),
			],
			contextField: "mySizes",
			contextFieldTransform: (ctx, idx) => ctx[idx].mySize,
		}),
	];

	const obj = {
		mySizes: [
			{ mySize: 2},
			{ mySize: 1},
			{ mySize: 4},
			{ mySize: 3},
		],
		myArray: [
			{ myField: Buffer.from([0x02, 0x12]) },
			{ myField: Buffer.from([0x01]) },
			{ myField: Buffer.from([0x04, 0x14, 0x24, 0x34]) },
			{ myField: Buffer.from([0x03, 0x13, 0x23]) },
		],
	};

	const buffer = Buffer.from([
		// first here's the table of sizes...
		0x02, // first blob is 2 bytes
		0x01, // second blob is 1 byte
		0x04, // third blob is 4 bytes
		0x03, // fourth blob is 3 bytes
		// ...and here's the data
		0x02, 0x12,             // read 2 bytes
		0x01,                   // read 1 byte
		0x04, 0x14, 0x24, 0x34, // read 4 bytes
		0x03, 0x13, 0x23,       // read 3 bytes
	]);

	const encoded = encode(definition, obj);

	t.truthy(bufeq(encoded, buffer));

});
