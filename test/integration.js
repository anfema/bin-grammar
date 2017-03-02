const test = require('ava');
const { parse, binary, enumeration, magic, uint32, uint8, binString, loop, selector, crc32 } = require('../index');

//
// chunk content parsers
//

// header
const ihdrParser = [
	uint32('width'),
	uint32('height'),
	uint8('bitDepth'),
	enumeration('colorType', { choices: {
		greyscale: 0,
		trueColor: 2,
		indexedColor: 3,
		grayscaleWithAlpha: 4,
		trueColorWithAlpha: 6
	} }),
	enumeration('compressionMethod', { choices: { deflate: 0 } }),
	enumeration('filterMethod', { choices: { adaptive: 0 } }),
	enumeration('interlaceMethod', { choices: { none: 0, adam7: 1 } }),
]

// binary image data
const idatParser = [binary('data')];

// no content
const iendParser = [];

//
// chunk parser
//

const chunkParser = [
	uint32('length'),
	crc32('crc', [
		binString('name', { size: 4 }),
		selector('data', {
			sizeField: 'length',
			field: 'name',
			flatten: true,
			select: [
				{ match: 'IHDR', struct: ihdrParser },
				{ match: 'IDAT', struct: idatParser },
				{ match: 'IEND', struct: iendParser },
			],
		}),
	]),
];

//
// header parser
//

const pngParser = [
	magic('magic', { data: Buffer.from('89504e470d0a1a0a', 'hex') }),
	loop('chunks', { struct: chunkParser })
];

// smallest possible 1x1 px transparent png
const buffer = Buffer.from(
	'89504E470D0A1A0A0000000D494844520000000100000001' +
	'0100000000376EF9240000001049444154789C6260010000' +
	'00FFFF03000006000557BFABD40000000049454E44AE426082',
	'hex'
);

test('png_parse', (t) => {
	const result = parse(pngParser, buffer);

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
	t.is(result.chunks[0].crc, true);
	t.is(result.chunks[1].name, 'IDAT');
	t.is(result.chunks[1].length, 16);
	t.is(result.chunks[1].data.length, 16);
	t.is(result.chunks[1].crc, true);
	t.is(result.chunks[2].name, 'IEND');
	t.is(result.chunks[2].length, 0);
	t.is(result.chunks[2].crc, true);
});
