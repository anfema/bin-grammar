const { Binary, BCD } = require('./binary');
const BitMask = require('./bitmask');
const { BitStruct, BitFlag, BitInt, BitUInt, BitEnum, BitBitMask } = require('./bitstruct');
const Enum = require('./enum');
const { Float, Double } = require('./float');
const { Int, Int8, Int16, Int32 } = require('./int');
const Magic = require('./magic');
const { BinString, ASCIIInteger, ASCIIFloat } = require('./string');
const { UInt, UInt8, UInt16, UInt32 } = require('./uint');
const Loop = require('./loop');
const Selector = require('./selector');
const { CRC, CRC32, CRC24, CRC16, CRC16_CCITT, CRC16_Modbus, CRC16_Kermit, CRC16_XModem, CRC8, CRC8_1Wire, CRC8_XOR } = require('./crc');

// Why do i have to do this nonsense? -.-
module.exports = {
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
