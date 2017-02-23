const BinParser = require('./src/parser.js');
const {
	Binary, BCD,
	BitMask,
	BitStruct, BitFlag, BitInt, BitUInt, BitEnum, BitBitMask,
	Enum,
	Float, Double,
	Int, Int8, Int16, Int32,
	Magic,
	BinString, ASCIIInteger, ASCIIFloat,
	UInt, UInt8, UInt16, UInt32,
	Loop,
	Selector,
} = require('./src/types');

module.exports = {
	BinParser,
	Binary, BCD,
	BitMask,
	BitStruct, BitFlag, BitInt, BitUInt, BitEnum, BitBitMask,
	Enum,
	Float, Double,
	Int, Int8, Int16, Int32,
	Magic,
	BinString, ASCIIInteger, ASCIIFloat,
	UInt, UInt8, UInt16, UInt32,
	Loop,
	Selector,
};
