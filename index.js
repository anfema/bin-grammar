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
	CRC, CRC32, CRC24, CRC16, CRC16_CCITT, CRC16_Modbus, CRC16_Kermit, CRC16_XModem, CRC8, CRC8_1Wire, CRC8_XOR,
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
	CRC, CRC32, CRC24, CRC16, CRC16_CCITT, CRC16_Modbus, CRC16_Kermit, CRC16_XModem, CRC8, CRC8_1Wire, CRC8_XOR,
};
