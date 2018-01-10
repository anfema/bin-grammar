/* eslint-disable object-property-newline */

const { binary, bcd } = require('./binary');
const bitMask = require('./bitmask');
const { bitStruct, bitFlag, bitInt, bitUInt, bitEnum, bitBitMask } = require('./bitstruct');
const enumeration = require('./enum');
const { float, double } = require('./float');
const { int, int8, int16, int32 } = require('./int');
const magic = require('./magic');
const { binString, asciiInteger, asciiFloat } = require('./string');
const { uint, uint8, uint16, uint32 } = require('./uint');
const loop = require('./loop');
const selector = require('./selector');
const { crc, crc32, crc24, crc16, crc16CCITT, crc16Modbus, crc16Kermit, crc16XModem, crc8, crc81Wire, crc8XOR } = require('./crc');
const delimString = require('./delimString');

// Why do i have to do this nonsense? -.-
module.exports = {
	binary, bcd,
	bitMask,
	bitStruct, bitFlag, bitInt, bitUInt, bitEnum, bitBitMask,
	enumeration,
	float, double,
	int, int8, int16, int32,
	magic,
	binString, asciiInteger, asciiFloat,
	uint, uint8, uint16, uint32,
	loop,
	selector,
	crc, crc32, crc24, crc16, crc16CCITT, crc16Modbus, crc16Kermit, crc16XModem, crc8, crc81Wire, crc8XOR,
	delimString,
};
