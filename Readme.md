# Binary Data Parser and Encoder

This project implements a DSL for specifying binary grammars to generate parsers for binary data in node.js.

There are some other projects that do similar things:

- [bin-parser](https://github.com/jfjlaros/bin-parser), does more or less the same but needs Yaml files
  to describe the grammar
- [binary](https://www.npmjs.com/package/binary), has a chained interface but gets complicated
  once you have more dynamic data structures

This library can encode binary data in addition to decoding.

## How to install

If you're using `npm` just use:

	npm install --save bin-grammar

If you're using `yarn`:

	yarn add bin-grammar

## Changelog

### 3.2.0

- Bugfix: CRC calculation failed (failed the test-suite too, how could this happen)
- Added `base` option to `asciiinteger`
- Code cleanup to validate with eslint

### 3.1.2

- Bugfix: Prefixed loops did throw an exception

### 3.1.1

- Bugfix: CRC did log a mismatch sometimes even if it actually was a match.

### 3.1.0

- Allow unbounded strings that will grab the rest of the buffer (a string with no options)

### 3.0.1

- Bugfix: If you had multiple cascaded selector elements in a crc the size field calculation did not work

### 3.0.0

- Big internal refactoring, interface for parser functions changed substantially
- Can now encode data to binary in addition to parsing from binary to Javascript Objects
- Can create templates for grammars to fill and encode to binary buffers
- Names are now lowercase as eslint complains on anything that is not a class if it begins with an uppercase letter

### 2.0.0

- Allow for default endianness setting on parser invocation to avoid sprinkling `bigEndian: false` everywhere when parsing little endian packets. This changed the interface, so we bumped to 2.0.0

### 1.1.0

- Add the `flatten` option to the Selector-DataType

### 1.0.1

- Bugfix: off by one error when parsing variable length zero terminated strings

## How to use

### Parsing

The example I will use here is parsing a PNG file. Why a PNG file? - It's short, useful and shows what
this library can do.

Our PNG file looks like this:

```javascript
// smallest possible 1x1 px transparent png
const buffer = Buffer.from(
	'89504E470D0A1A0A0000000D494844520000000100000001' +
	'0100000000376EF9240000001049444154789C6260010000' +
	'00FFFF03000006000557BFABD40000000049454E44AE426082',
	'hex'
);
```

Now let me explain the structure of that PNG in plain words before we start:

1. The first few bytes are the so called file magic number, with that you can check if it's really
   a PNG file you're handling and if something modified the file in transfer (like converting line
   endings). So if the magic does not match the file is corrupted or not a PNG. The magic looks like
   this: `89504e470d0a1a0a`
2. The remainder of the file is built out of so called *chunks* which have the following format:
	- 4 Bytes size of the following chunk
	- The 4 Bytes ASCII chunk header
	- The chunk data (which is `size - 4` bytes long)

Each chunk has it's own data format of which we will just parse the `IHDR` chunk for this example here.

#### Defining a grammar

To define a grammar you have to list the items that make up your data chunk in the order they will appear.
This library has a lot of convenience functions to make most parsing rather easy (like zero terminated
strings, CRCs, Loops and Switches)

You can [experiment with the example on RunKit](https://runkit.com/dunkelstern/runkit-npm-bin-grammar-example) if you like. It's the exact same code we are building here.

Let's define a grammar for PNG files. We will be starting with the magic header and then loop over the
chunks:

```javascript
const pngGrammar = [
	magic('magic', { data: Buffer.from('89504e470d0a1a0a', 'hex') }),
	loop('chunks', { struct: chunkGrammar })
];
```

This validates the magic and then calls a secondary grammar in a loop (`chunkGrammar`).

To parse a chunk we can use the following grammar:

```javascript
const chunkGrammar = [
	uint32('length'),
	crc32('crc', [
		binString('name', { size: 4 }),
		selector('data', {
			sizeField: 'length',
			field: 'name',
			flatten: true,
			select: [
				{ match: 'IHDR', struct: ihdrGrammar },
				{ match: 'IDAT', struct: idatGrammar },
				{ match: 'IEND', struct: iendGrammar },
			],
		}),
	]),
];
```

This one is a bit more involved, it reads the size of the chunk into the `length` field, which we define
to be an unsigned integer of 32 bits length, then checks the CRC over the following block (crc field is
assumed to be appended to data). The following fields define the chunk header and the chunk data.

We use a `Selector` to divide the parsing up into three more grammars, one for each chunk type. The
determining factor is the `name` field and the size of the data we will consume is encoded in the `length`
field. (If you wanted to calculate something on the `sizeField`, like substracting header length, you can
set `sizeFieldTransform` to a transform function). We define the parser may `flatten` the result, which
means it does not create an object with just one key-value pair in it but ignores the name of that value
and flattens the object to a single value.

The chunk grammars are set up like this:

```javascript
// header
const ihdrGrammar = [
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
const idatGrammar = [binary('data')];

// no content
const iendGrammar = [];
```

Let's begin with the shortest grammar `IEND` which is empty, because the end marker chunk does not
contain any data.

The data chunk (`IDAT`) just contains the compressed image data, which we would decompress and
decode after parsing the file structure. In this example we just define it as `binary` data and
ignore it. As we defined that the selector should flatten the tree, the data is saved directly into
the `data` field on the toplevel.

The interesting part is the header grammar (`IHDR`) which tells us something about the image we
can actually parse and make use of. At first there are some integers which describe the dimensions
of the image. The next bytes that follow define the color type, compression method, filtering and
interlacing methods used in the image. As there are only some valid entries we use an `Enum` which
returns just the key when it finds something or `null` if the value was invalid.

To finally apply that grammar stack to our buffer we just call the parser and get a javascript
object with the results back:

```javascript
const result = parse(pngGrammar, buffer);
```

The `result` is something like this:

```json
{
  "magic": true,
  "chunks": [
    {
      "length": 13,
      "name": "IHDR",
      "data": {
        "width": 1,
        "height": 1,
        "bitDepth": 1,
        "colorType": "greyscale",
        "compressionMethod": "deflate",
        "filterMethod": "adaptive",
        "interlaceMethod": "none"
      },
      "crc": true
    },
    {
      "length": 16,
      "name": "IDAT",
      "data": {
        "type": "Buffer",
        "data": [
          120, 156,  98,  96,   1,   0,   0,   0,
          255, 255,   3,   0,   0,   6,   0,   5
        ]
      },
      "crc": true
    },
    {
      "length": 0,
      "name": "IEND",
      "data": {},
      "crc": true
    }
  ]
}
```

### Encoding

To encode a Javascript object into a binary buffer we use the exact same grammar as for decoding the binary buffers into an object in the first place.

For example if we use the PNG grammar from above we can re-encode the result object into a binary buffer:

```javascript
const binaryBuffer = encode(pngGrammar, result);

// if we compare the original buffer with the generated output we get an exact match.
// This outputs 0 which means the buffers match
console.log(binaryBuffer.compare(buffer));
```

### Templating

You can use the `template` function to generate an empty Javascript object that, if filled correctly, can be used to encode data.

The result of a `template` call for the mentioned PNG grammar would like this:

```json
{
  "magic": true,
  "chunks": []
}
```

Which does not do much, you'll have to tell the templater which items you want on which positions:

```javascript
// we want three items in the `chunks` loop, one of each chunk type in the correct order:
const png = template(pngGrammar, { chunks: ['IHDR', 'IDAT', 'IEND'] });
```

The `png` object would then look like this:

```json
{
  "magic": true,
  "chunks": [
    {
      "length": 0,
      "name": "IHDR",
      "data": {
        "width": 0,
        "height": 0,
        "bitDepth": 0,
        "colorType": null,
        "compressionMethod": null,
        "filterMethod": null,
        "interlaceMethod": null
      },
      "crc": true
    },
    {
      "length": 0,
      "name": "IDAT",
      "data": {
        "type": "Buffer",
        "data": []
      },
      "crc": true
    },
    {
      "length": 0,
      "name": "IEND",
      "data": {},
      "crc": true
    }
  ]
}
```

All values are set to neutral default values. Note that the length fields are all zero, those will be updated by the encoder when it knows the exact sizes of the object. `magic` and `crc` fields are just there to complete the object, the encoder will ignore the values of those fields and insert the correct magic bytes and calculated CRCs in their places.

Let's fill our template and try encoding it:

```javascript
const png = template(pngGrammar, { chunks: ['IHDR', 'IDAT', 'IEND'] });

png.chunks[0].data.width = 1;
png.chunks[0].data.height = 1;
png.chunks[0].data.bitDepth = 1;
png.chunks[0].data.colorType = 'greyscale';
png.chunks[0].data.compressionMethod = 'deflate';
png.chunks[0].data.filterMethod = 'adaptive';
png.chunks[0].data.interlaceMethod = 'none';
png.chunks[1].data = Buffer.from('789C626001000000FFFF030000060005', 'hex');

const binaryBuffer = encode(pngGrammar, png);

// if we compare the original buffer with the generated output we get an exact match.
// This outputs 0 which means the buffers match
console.log(binaryBuffer.compare(buffer));
```

## Parser interface

- Function name: `parse`
- Parameters:
	- `definition`: the grammar to use
	- `buffer`: the buffer to parse
	- `options`: options object
- Options:
	- `bigEndian`: sets the default endianness of the parser (default: `true`)
- Returns: Javascript Object with parsed structure

## Encoder interface

- Function name: `encode`
- Parameters:
	- `definition`: the grammar to use
	- `object`: the object to encode
	- `options`: options object
- Options:
	- `bigEndian`: sets the default endianness of the parser (default: `true`)
- Returns: `Buffer` with encoded binary data


## Templating interface

- Function name: `template`
- Parameters:
	- `definition`: the grammar to use
	- `subItemData`: Javascript object of sub-item data to include in the template, see example above
- Returns: Javascript object of the structure defined by `definition`, fill this template and call `encode` with it to generate binary data

## Available data types

The following datatypes are defined in the library, you can define your own like this:

```javascript
// Parsing function
//
// name: name of the field
// object: settings for the type, usually `size` and `transform`
//
// This example just returns a buffer slice which is sent through
// the `transform`-function.
//
// The type function returns a Javascript Object with the following functions:
//  - `parse`: the parse function
//  - `prepareEncode`: called before the `encode` function, to update `sizeField` type external fields
//  - `encode`: encode a object into a buffer
//  - `makeStruct`: make an empty structure for this item (used by the `template` function)
//  - `name`: the name of the field
function customType(name, { size = 1, transform = value => value, reverseTransform = value => value } = {}) {

	// this function is called to parse a buffer
	//
	// `buffer`: buffer slice to parse
	// `parseTree`: the tree of objects already parsed
	// options:
	//  - `bigEndian`: Big endian setting from the parser to inherit from
	//                 when not explicitly set
	//
	// returns: Object with `value` and `size`
	function parse(buffer, parseTree, { bigEndian: inheritBigEndian }) {
		return {
			value: transform(buffer.slice(0, size)),
			size,
		};
	};

	// this function is called before encoding an object
	// Attention: The only effect of this function is the side effect on the `parseTree`
	//
	// `object`: the object to encode
	// `parseTree`: the template/object tree
	// options:
	//  - `bigEndian`: Big endian setting from the parser to inherit from
	//                 when not explicitly set
	//
	// returns: nothing
	function prepareEncode(object, parseTree, { bigEndian }) {
		// nothing to do
	}

	// this is called to encode a object
	//
	// `object`: the object to encode
	// options:
	//  - `bigEndian`: Big endian setting from the parser to inherit from
	//                 when not explicitly set
	//
	// returns: Buffer with encoded object
	function encode(object, { bigEndian }) {
		return reverseTransform(object);
	}

	// this is called by the template function to build a template tree
	// loops will get an Array for `item` with objects that should be
	// given to the elements in the loop. All other elements will get
	// the `item` of the loop iteration.
	//
	// `parseTree`: built parse tree until when this element turned up
	// `item`: item to make a struct for, see above
	//
	// returns: structure a call to parse would yield on this type
	function makeStruct(parseTree, item) {
		return Buffer.alloc(0);
	}

	// return all the functions
	return { parse, prepareEncode, encode, makeStruct, name };
}
```

### Binary data

- Type name: `binary`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or `undefined` if variable length
	- `sizeField`: if set use this field name from the parse tree for the size of this data item
	- `sizePrefixed`: if set it is assumed that the data is prefixed with it's length (default: `false`)
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: override big endian encoding for the size prefix (default: as defined in parser)
	- `sizeFieldTransform`: transform function to call before using the value of the size field
	- `transform`: result value transform function to call on the data before returning it as result

If no size is defined at all the parser just uses the rest of the buffer. You will get an exception if the
`sizeField` is defined but does not exist though.

### Strings

- Type name: `binString`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or 0 if variable length
	- `encoding`: the encoding to convert the buffer data to
	- `nullTerminated`: if size is 0 this defines a variable length string with a zero terminator (default: `false`)
	- `sizePrefixed`: if set it is assumed that the string is prefixed with it's length (default: `false`)
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: override big endian encoding for the size prefix (default: as defined in parser)
	- `sizeField`: field in the parse tree that defines the size
	- `sizeFieldTransform`: transform function applied to the size field before using the value
	- `transform`: transform function applied before returning the string

If no size is defined at all the string parser just uses the rest of the buffer. You will get an exception if the
`sizeField` is defined but does not exist though.

---

- Type name: `delimString`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `encoding`: the encoding to convert the buffer data to
	- `delimiter`: string delimiter (default: `\r\n`)
	- `inclusive`: include the delimiter in the string (default: `false`)
	- `transform`: transform function applied before returning the string

Parse strings separated by the given `delimiter`.
If `inclusive` is TRUE, the delimiter is included in any parsed string. On encode, the string to be
encoded must end with the delimiter.
If `inclusive` is FALSE, the delimiter is not included in the parsed string but is silently consumed.
On encode, input strings have the delimiter silently appended before they are encoded.
If no size is defined at all the string parser just uses the rest of the buffer.


### Numbers

#### Signed Integers

Signed integers are two's complement, which means if the first bit is a one the value is negative.

- Generic type name: `int`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length
	- `bigEndian`: override big endian encoding (default: as defined in parser)
	- `transform`: value transformer function gets the parsed value as parameter
- Specialized types: `int8` (8 Bit integer), `int16` (16 Bit integer), `int32` (32 Bit integer)

Attention: The `size` may not be bigger than `4` (32 Bits) as Javascript only guarantees bit operations
to be accurate to that size. If you need bigger types you'll have to define your own types using a
big number library of your choosing.

#### Unsigned Integers

- Generic type name: `uint`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length
	- `bigEndian`: override big endian encoding (default: as defined in parser)
	- `transform`: value transformer function gets the parsed value as parameter
- Specialized types: `uint8` (8 Bit integer), `uint16` (16 Bit integer), `uint32` (32 Bit integer)

Attention: The `size` may not be bigger than `4` (32 Bits) as Javascript only guarantees bit operations
to be accurate to that size. If you need bigger types you'll have to define your own types using a
big number library of your choosing.

#### IEEE Floats and Doubles

- Generic type name: `float`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length (either 4 or 8, as IEEE does not define other lengths, default: `4`)
	- `bigEndian`: override big endian encoding (default: as defined in parser)
	- `transform`: value transformer function gets the parsed value as parameter
- Specialized type: `double` (8 byte IEEE double)

#### BCD and ASCII numbers

- Type name: `bcd`
- Decodes BCD encoded numbers: `0x12 0x34` decodes to `1234`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or `undefined` if variable length
	- `sizeField`: if set use this field name from the parse tree for the size of this data item
	- `sizePrefixed`: if set it is assumed that the data is prefixed with it's length
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: override big endian encoding for the size prefix (default: as defined in parser)
	- `sizeFieldTransform`: transform function to call before using the value of the size field
	- `transform`: result value transform function to call on the data before returning it as result

---

- Type name: `asciiInteger`
- Decodes _Human readable_ integers: `0x31 0x32 0x33 0x34` decodes to `1234`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or 0 if variable length
	- `base`: number base, defaults to 10
	- `nullTerminated`: if size is 0 this defines a variable length string with a zero terminator
	- `sizePrefixed`: if set it is assumed that the string is prefixed with it's length
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: override big endian encoding for the size prefix (default: as defined in parser)
	- `sizeField`: field in the parse tree that defines the size
	- `sizeFieldTransform`: transform function applied to the size field before using the value
	- `transform`: transform function applied before returning the number

---

- Type name: `asciiFloat`
- Decodes _Human readable_ floats: `0x31 0x32 0x33 0x34 0x2E 0x35 0x36` decodes to `1234.56`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or 0 if variable length
	- `nullTerminated`: if size is 0 this defines a variable length string with a zero terminator
	- `sizePrefixed`: if set it is assumed that the string is prefixed with it's length
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: override big endian encoding for the size prefix (default: as defined in parser)
	- `sizeField`: field in the parse tree that defines the size
	- `sizeFieldTransform`: transform function applied to the size field before using the value
	- `transform`: transform function applied before returning the number

### Fixed bytes / Magic bytes

- Type name: `magic`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `data`: `Buffer` or `String` of the expected pattern to find.
	- `encoding`: If using a `String` for data, the encoding which to apply to the raw bytes
	  before comparison

### Binary types

- Type name: `bitMask`
- Decodes a list of bits into readable flags
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length
	- `bitfield`: Object, key is the name of the flag, value is the bit number for this name

---

- Type name: `enumeration`
- Decodes a value into a readable enumeration value
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length
	- `bigEndian`: override big endian encoding (default: as defined in parser)
	- `choices`: Object, key is the name of the enumerated value, value is the value to check for

### Byte deconstruction

Use these types if you want to act on Bit-sizes instead of Bytes. These types only work within a
`bitStruct` container.

---

- Type name: `bitStruct`
- Acts as a container for Bit types
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length of this bit struct
	- `sizeField`: size field from the parse tree
	- `sizeFieldTransform`: transform function to apply before using the value of `sizeField`
	- `elements`: array of sub elements, only `Bit` elements allowed

---

- Sub-type name: `bitFlag`
- A one bit flag value
- Parameters:
	- `name`: Name of the field
- Options: none

---

- Sub-type name: `bitInt`
- Signed integer (two's complement, negative if first bit is set)
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: bit length of the integer
	- `transform`: value transformer function

---

- Sub-type name: `bitUInt`
- Unsigned integer
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: bit length of the integer
	- `transform`: value transformer function

---

- Sub-type name: `bitEnum`
- Enumeration of values
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: bit length of the enum
	- `choices`: Object, key is the name of the enumerated value, value is the value to check for

---

- Sub-type name: `bitBitMask`
- List of flags
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: bit length of the bitmask
	- `bitfield`: Object, key is the name of the flag, value is the bit number for this name

### Loops

Use `loop` elements if a list of elements repeats.

- Type name: `loop`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `struct`: array, the structure that repeats
	- `repetitions`: how often the sub-struct repeats (default: `Infinity`)
	- `repetitionsPrefixed`: this loop is prefixed with a repetition count
	- `repetitionsPrefixLength`: size of the prefix
	- `repetitionsBigEndian`: override endianness of size prefix (default: as defined in parser)
	- `repetitionsField`: field in the parse tree that defines the repetition count

### Switch statements

Use a `selector` to switch between grammars based on a field.

- Type name: `selector`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `select`: object for switch cases: `match` = value to match, `struct` = sub-struct to parse
	- `field`: field to check for value
	- `flatten`: if set to `true` the parser will flatten "one value objects" to map to the `name` directly
	- `sizeField`: size field from parse tree
	- `sizeFieldTransfrom`: transform function to modify the size field value before using it

### CRCs

CRC types wrap a list of other elements over which the CRC is calculated. The CRC field is assumed
to follow the wrapped fields immediately. The result of the CRC function is either `true` if the
CRC matches or `false` if it does not.

- Generic type name: `crc`
- Parameters:
	- `name`: Name of the CRC field
	- `elements`: Array, list of elements to calculate the CRC over
	- `crcSize`: size of the CRC in bytes
	- `crcFunction`: function to calculate the CRC, gets a buffer slice with the data to check
- Specialized types:
	- `crc32`
	- `crc24`
	- `crc16`
	- `crc16CCITT`
	- `crc16Modbus`
	- `crc16Kermit`
	- `crc16XModem`
	- `crc8`
	- `crc81Wire`
	- `crc8XOR` (Not really a CRC but used in some protocols as a parity value)


# TODO

- Write loop tests
