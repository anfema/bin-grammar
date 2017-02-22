const test = require('ava');
const { BinParser, Binary, Enum, Magic, UInt32, UInt8, BinString, Loop, Selector } = require('../index');

//
// chunk content parsers
//

// header
const ihdrParser = [
	UInt32('width'),
	UInt32('height'),
	UInt8('bitDepth'),
	Enum('colorType', { choices: {
		greyscale: 0,
		trueColor: 2,
		indexedColor: 3,
		grayscaleWithAlpha: 4,
		trueColorWithAlpha: 6
	}}),
	Enum('compressionMethod', { choices: { deflate: 0 }}),
	Enum('filterMethod', { choices: { adaptive: 0 }}),
	Enum('interlaceMethod', { choices: { none: 0, adam7: 1 }}),
]

// binary image data
const idatParser = [ Binary('data') ];

// no content
const iendParser = [ ];

//
// chunk parser
//

const chunkParser = [
	UInt32('length'),
	BinString('name', { size: 4 }),
	Selector('data', {
		sizeField: 'length',
		field: 'name',
		select: [
			{ match: 'IHDR', struct: ihdrParser },
			{ match: 'IDAT', struct: idatParser },
			{ match: 'IEND', struct: iendParser },
		],
	}),
	Binary('crc', { size: 4 }),
];

//
// header parser
//

const pngParser = [
	Magic('magic', { data: Buffer.from('89504e470d0a1a0a', 'hex') }),
	Loop('chunks', { struct: chunkParser })
];

// smallest possible 1x1 px transparent png
const buffer = Buffer.from(
	'89504E470D0A1A0A0000000D494844520000000100000001' +
	'0100000000376EF9240000001049444154789C6260010000' +
	'00FFFF03000006000557BFABD40000000049454E44AE426082',
	'hex'
);

test('png_parse', t => {
	const result = BinParser(pngParser, buffer);

	t.is(result.magic, true);
	t.is(result.chunks.length, 3);
	t.is(result.chunks[0].length, 13);
	t.is(result.chunks[0].name, 'IHDR');
	t.is(result.chunks[0].data.width, 1);
	t.is(result.chunks[0].data.height, 1);
	t.is(result.chunks[0].data.bitDepth, 1);
	t.is(result.chunks[0].data.colorType, 'greyscale');
	t.is(result.chunks[0].data.compressionMethod, 'deflate');
	t.is(result.chunks[0].data.filterMethod, 'adaptive');
	t.is(result.chunks[0].data.interlaceMethod, 'none');
	t.is(result.chunks[0].crc.compare(Buffer.from('376ef924', 'hex')), 0);
});
