const { BinString } = require('./string');
const crc = require('crc');

// internal function, just xors all bytes together
function crc8_xor(buffer) {
	let result = 0;

	for (const character of buffer) {
		result ^= character;
	}

	return result;
}

// Generic CRC function
//
// name: name of the crc field
// elements: elements over which to calculate the CRC, will be appended to toplevel parse tree as
//           if the CRC item was never inserted
// crcSize: byte size of the checksum
// crcFunction: crc function to call, will be called with a buffer slice as sole parameter
//
// returns: parser function to calculate and validate a CRC checksum (returns true or false)
function CRC(name, elements, crcSize, crcFunction) {
	return function (buffer, parseTree, { bigEndian }) {
		let offset = 0;

		// execute all elements, add to toplevel parse tree (yeah some kind of hack, i know)
		for (const item of elements) {
			const slice = buffer.slice(offset, buffer.length);
			const r = item(slice, parseTree, { bigEndian });

			parseTree[r.name] = r.value;
			offset += r.size;
		}

		// read crc
		const crcParser = BinString('crc', { size: crcSize, encoding: 'hex' });
		const r = crcParser(buffer.slice(offset, offset + crcSize), {}, { bigEndian });
		const checksum = r.value;

		// calculate crc
		const calculated = crcFunction(buffer.slice(0, offset)).toString(16);

		const match = (checksum === calculated);

		return {
			name,
			value: match,
			size: offset + crcSize,
		};
	};
}

// CRC 32 checksumming function
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC32(name, elements) {
	return CRC(name, elements, 4, crc.crc32);
}

// CRC 24 checksumming function
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC24(name, elements) {
	return CRC(name, elements, 3, crc.crc24);
}

// CRC 16 checksumming function
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC16(name, elements) {
	return CRC(name, elements, 2, crc.crc16);
}

// CRC 16 checksumming function with CCITT tables
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC16_CCITT(name, elements) {
	return CRC(name, elements, 2, crc.crc16ccitt);
}

// CRC 16 checksumming function with Modbus tables
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC16_Modbus(name, elements) {
	return CRC(name, elements, 2, crc.crc16modbus);
}

// CRC 16 checksumming function, Kermit version
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC16_Kermit(name, elements) {
	return CRC(name, elements, 2, crc.crc16kermit);
}

// CRC 16 checksumming function, XModem version
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC16_XModem(name, elements) {
	return CRC(name, elements, 2, crc.crc16xmodem);
}

// CRC 8 checksumming function
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC8(name, elements) {
	return CRC(name, elements, 1, crc.crc8);
}

// CRC 8 checksumming function, 1 Wire version
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC8_1Wire(name, elements) {
	return CRC(name, elements, 1, crc.crc81wire);
}

// CRC 8 "checksumming"" function, this one just XORs all bytes, not a real checksum
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function CRC8_XOR(name, elements) {
	return CRC(name, elements, 1, crc8_xor);
}

// export everything
module.exports = {
	CRC,
	CRC32,
	CRC24,
	CRC16,
	CRC16_CCITT,
	CRC16_Modbus,
	CRC16_Kermit,
	CRC16_XModem,
	CRC8,
	CRC8_1Wire,
	CRC8_XOR,
}
