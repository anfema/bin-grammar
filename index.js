/* eslint-disable object-property-newline */
const parse = require('./src/parser.js');
const encode = require('./src/encoder.js');
const template = require('./src/struct_builder.js');

const {
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
} = require('./src/types');

module.exports = {
	parse, encode, template,
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
};
