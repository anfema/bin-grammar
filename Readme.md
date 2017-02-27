# Binary Data Parser

This project implements a DSL for specifying binary grammars to generate parsers for binary data in node.js.

There are some other projects that do similar things:

- [bin-parser](https://github.com/jfjlaros/bin-parser), does more or less the same but needs Yaml files
  to describe the grammar
- [binary](https://www.npmjs.com/package/binary), has a chained interface but gets complicated
  once you have more dynamic data structures

## How to install

If you're using `npm` just use:

	npm install --save bin-grammar

If you're using `yarn`:

	yarn add bin-grammar

## How to use

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

### Defining a grammar

To define a grammar you have to list the items that make up your data chunk in the order they will appear.
This library has a lot of convenience functions to make most parsing rather easy (like zero terminated
strings, CRCs, Loops and Switches)

Let's define a grammar for PNG files. We will be starting with the magic header and then loop over the
chunks:

```javascript
const pngGrammar = [
	Magic('magic', { data: Buffer.from('89504e470d0a1a0a', 'hex') }),
	Loop('chunks', { struct: chunkGrammar })
];
```

This validates the magic and then calls a secondary grammar in a loop (`chunkGrammar`).

To parse a chunk we can use the following grammar:

```javascript
const chunkGrammar = [
	UInt32('length'),
	CRC32('crc', [
		BinString('name', { size: 4 }),
		Selector('data', {
			sizeField: 'length',
			field: 'name',
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
set `sizeFieldTransform` to a transform function).

The chunk grammars are set up like this:

```javascript
// header
const ihdrGrammar = [
	UInt32('width'),
	UInt32('height'),
	UInt8('bitDepth'),
	Enum('colorType', { choices: {
		greyscale: 0,
		trueColor: 2,
		indexedColor: 3,
		grayscaleWithAlpha: 4,
		trueColorWithAlpha: 6
	} }),
	Enum('compressionMethod', { choices: { deflate: 0 } }),
	Enum('filterMethod', { choices: { adaptive: 0 } }),
	Enum('interlaceMethod', { choices: { none: 0, adam7: 1 } }),
]

// binary image data
const idatGrammar = [Binary('data')];

// no content
const iendGrammar = [];
```

Let's begin with the shortest grammar `IEND` which is empty, because the end marker chunk does not
contain any data.

The data chunk (`IDAT`) just contains the compressed image data, which we would decompress and
decode after parsing the file structure. In this example we just define it as `Binary` data and
ignore it.

The interesting part is the header grammar (`IHDR`) which tells us something about the image we
can actually parse and make use of. At first there are some integers which describe the dimensions
of the image. The next bytes that follow define the color type, compression method, filtering and
interlacing methods used in the image. As there are only some valid entries we use an `Enum` which
returns just the key when it finds something or `null` if the value was invalid.

To finally apply that grammar stack to our buffer we just call the parser and get a javascript
object with the results back:

```javascript
const result = BinParser(pngGrammar, buffer);
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
        "data": {
          "type": "Buffer",
          "data": [
            120, 156,  98,  96,   1,   0,   0,   0,
            255, 255,   3,   0,   0,   6,   0,   5
          ]
        }
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
// buffer: contains the buffer slice to parse, usually the buffer
//         is sliced from the current offset to the end of the buffer
// parseTree: contains the parse tree that has been generated before
//            this parser function is called. Used to access external
//            size fields, etc.
//
// The parse function returns the field name, the parsed value and
// the number of bytes consumed in the process.
function CustomType(name, { size = 1, transform = value => value } = {}) {
	return function (buffer, parseTree) {
		return {
			name,
			value: transform(buffer.slice(0, size)),
			size,
		};
	};
}
```

### Binary data

- Type name: `Binary`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or `undefined` if variable length
	- `sizeField`: if set use this field name from the parse tree for the size of this data item
	- `sizePrefixed`: if set it is assumed that the data is prefixed with it's length (default: `false`)
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: set big endian encoding for the size prefix (default: `true`)
	- `sizeFieldTransform`: transform function to call before using the value of the size field
	- `transform`: result value transform function to call on the data before returning it as result

### Strings

- Type name: `BinString`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or 0 if variable length
	- `encoding`: the encoding to convert the buffer data to
	- `nullTerminated`: if size is 0 this defines a variable length string with a zero terminator (default: `false`)
	- `sizePrefixed`: if set it is assumed that the string is prefixed with it's length (default: `false`)
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: set big endian encoding for the size prefix
	- `sizeField`: field in the parse tree that defines the size
	- `sizeFieldTransform`: transform function applied to the size field before using the value
	- `transform`: transform function applied before returning the string

### Numbers

#### Signed Integers

Signed integers are two's complement, which means if the first bit is a one the value is negative.

- Generic type name: `Int`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length
	- `bigEndian`: choose big endian encoding, else little endian encoded (default: `true`)
	- `transform`: value transformer function gets the parsed value as parameter
- Specialized types: `Int8` (8 Bit integer), `Int16` (16 Bit integer), `Int32` (32 Bit integer)

Attention: The `size` may not be bigger than `4` (32 Bits) as Javascript only guarantees bit operations
to be accurate to that size. If you need bigger types you'll have to define your own types using a
big number library of your choosing.

#### Unsigned Integers

- Generic type name: `UInt`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length
	- `bigEndian`: choose big endian encoding, else little endian encoded (default: `true`)
	- `transform`: value transformer function gets the parsed value as parameter
- Specialized types: `UInt8` (8 Bit integer), `UInt16` (16 Bit integer), `UInt32` (32 Bit integer)

Attention: The `size` may not be bigger than `4` (32 Bits) as Javascript only guarantees bit operations
to be accurate to that size. If you need bigger types you'll have to define your own types using a
big number library of your choosing.

#### IEEE Floats and Doubles

- Generic type name: `Float`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length (either 4 or 8, as IEEE does not define other lengths, default: `4`)
	- `bigEndian`: choose big endian encoding, else little endian encoded (default: `true`)
	- `transform`: value transformer function gets the parsed value as parameter
- Specialized type: `Double` (8 byte IEEE double)

#### BCD and ASCII numbers

- Type name: `BCD`
- Decodes BCD encoded numbers: `0x12 0x34` decodes to `1234`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or `undefined` if variable length
	- `sizeField`: if set use this field name from the parse tree for the size of this data item
	- `sizePrefixed`: if set it is assumed that the data is prefixed with it's length
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: set big endian encoding for the size prefix
	- `sizeFieldTransform`: transform function to call before using the value of the size field
	- `transform`: result value transform function to call on the data before returning it as result

---

- Type name: `ASCIIInteger`
- Decodes _Human readable_ integers: `0x31 0x32 0x33 0x34` decodes to `1234`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or 0 if variable length
	- `nullTerminated`: if size is 0 this defines a variable length string with a zero terminator
	- `sizePrefixed`: if set it is assumed that the string is prefixed with it's length
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: set big endian encoding for the size prefix
	- `sizeField`: field in the parse tree that defines the size
	- `sizeFieldTransform`: transform function applied to the size field before using the value
	- `transform`: transform function applied before returning the number

---

- Type name: `ASCIIFloat`
- Decodes _Human readable_ floats: `0x31 0x32 0x33 0x34 0x2E 0x35 0x36` decodes to `1234.56`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length or 0 if variable length
	- `nullTerminated`: if size is 0 this defines a variable length string with a zero terminator
	- `sizePrefixed`: if set it is assumed that the string is prefixed with it's length
	- `sizePrefixLength`: length of the size prefix
	- `sizePrefixBigEndian`: set big endian encoding for the size prefix
	- `sizeField`: field in the parse tree that defines the size
	- `sizeFieldTransform`: transform function applied to the size field before using the value
	- `transform`: transform function applied before returning the number

### Fixed bytes / Magic bytes

- Type name: `Magic`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `data`: `Buffer` or `String` of the expected pattern to find.
	- `encoding`: If using a `String` for data, the encoding which to apply to the raw bytes
	  before comparison

### Binary types

- Type name: `BitMask`
- Decodes a list of bits into readable flags
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length
	- `bitfield`: Object, key is the name of the flag, value is the bit number for this name

---

- Type name: `Enum`
- Decodes a value into a readable enumeration value
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: byte length
	- `bigEndian`: choose big endian encoding, else little endian encoded (default: `true`)
	- `choices`: Object, key is the name of the enumerated value, value is the value to check for

### Byte deconstruction

Use these types if you want to act on Bit-sizes instead of Bytes. These types only work within a
`BitStruct` container.

---

- Type name: `BitStruct`
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

- Sub-type name: `BitFlag`
- A one bit flag value
- Parameters:
	- `name`: Name of the field
- Options: none

---

- Sub-type name: `BitInt`
- Signed integer (two's complement, negative if first bit is set)
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: bit length of the integer
	- `transform`: value transformer function

---

- Sub-type name: `BitUInt`
- Unsigned integer
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: bit length of the integer
	- `transform`: value transformer function

---

- Sub-type name: `BitEnum`
- Enumeration of values
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: bit length of the enum
	- `choices`: Object, key is the name of the enumerated value, value is the value to check for

---

- Sub-type name: `BitBitMask`
- List of flags
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `size`: bit length of the bitmask
	- `bitfield`: Object, key is the name of the flag, value is the bit number for this name

## Loops

Use `Loop` elements if a list of elements repeats.

- Type name: `Loop`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `struct`: array, the structure that repeats
	- `repetitions`: how often the sub-struct repeats (default: `Infinity`)
	- `repetitionsPrefixed`: this loop is prefixed with a repetition count
	- `repetitionsPrefixLength`: size of the prefix
	- `repetitionsBigEndian`: endianness of size prefix (default: `true`)
	- `repetitionsField`: field in the parse tree that defines the repetition count

## Switch statements

Use a `Selector` to switch between grammars based on a field.

- Type name: `Selector`
- Parameters:
	- `name`: Name of the field
	- `options`: Options object
- Options:
	- `select`: object for switch cases: `match` = value to match, `struct` = sub-struct to parse
	- `field`: field to check for value
	- `sizeField`: size field from parse tree
	- `sizeFieldTransfrom`: transform function to modify the size field value before using it

## CRCs

CRC types wrap a list of other elements over which the CRC is calculated. The CRC field is assumed
to follow the wrapped fields immediately. The result of the CRC function is either `true` if the
CRC matches or `false` if it does not.

- Generic type name: `CRC`
- Parameters:
	- `name`: Name of the CRC field
	- `elements`: Array, list of elements to calculate the CRC over
	- `crcSize`: size of the CRC in bytes
	- `crcFunction`: function to calculate the CRC, gets a buffer slice with the data to check
- Specialized types:
	- `CRC32`
	- `CRC24`
	- `CRC16`
	- `CRC16_CCITT`
	- `CRC16_Modbus`
	- `CRC16_Kermit`
	- `CRC16_XModem`
	- `CRC8`
	- `CRC8_1Wire`
	- `CRC8_XOR` (Not really a CRC but used in some protocols as a parity value)
