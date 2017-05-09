const { uint } = require('./uint');
const { binString } = require('./string');
const crcLib = require('crc');

// internal function, just xors all bytes together
function crc8xor(buffer) {
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
function crc(name, elements, crcSize, crcFunction) {
	function parse(buffer, parseTree, { bigEndian }) {
		let offset = 0;

		// execute all elements, add to toplevel parse tree (yeah some kind of hack, i know)
		for (const { parse: parseItem, name: itemName } of elements) {
			const slice = buffer.slice(offset, buffer.length);
			const r = parseItem(slice, parseTree, { bigEndian });

			parseTree[itemName] = r.value;
			offset += r.size;
		}

		// read crc
		const crcParser = binString('crc', { size: crcSize, encoding: 'hex' }).parse;
		const r = crcParser(buffer.slice(offset, offset + crcSize), {}, { bigEndian });
		const checksum = r.value;

		// calculate crc
		const calculated = (`00000000${crcFunction(buffer.slice(0, offset)).toString(16)}`).slice(-crcSize * 2);

		const match = (checksum === calculated);

		return {
			value: match,
			size: offset + crcSize,
		};
	}

	function prepareEncode(object, parseTree, { bigEndian }) {
		if ((parseTree[name] === undefined) || (parseTree[name] === true)) {
			parseTree[name] = {};
		}

		// prepare all sub items
		for (const { prepareEncode: prepareEncodeItem, name: itemName } of elements) {
			prepareEncodeItem(parseTree[itemName], parseTree, { bigEndian });
		}

		// move to subtree, so we find them later
		for (const { name: itemName } of elements) {
			parseTree[name][itemName] = parseTree[itemName];
		}

		// remove original fields from parseTree as we got copies in our subtree
		for (const { name: itemName } of elements) {
			parseTree[itemName] = undefined;
		}
	}

	function encode(object, { bigEndian }) {
		const buffers = [];

		// encode all elements and add to buffer list
		for (const { encode: encodeItem, name: itemName } of elements) {
			const r = encodeItem(object[itemName], { bigEndian });

			buffers.push(r);
		}

		const calculated = crcFunction(Buffer.concat(buffers));

		// write crc
		const crcEncoder = uint('crc', { size: crcSize, bigEndian: true }).encode;
		const r = crcEncoder(calculated, { bigEndian });

		const data = Buffer.concat([...buffers, r]);

		return data;
	}

	function makeStruct(parseTree, item) {
		for (const { name: itemName, makeStruct: makeItemStruct } of elements) {
			parseTree[itemName] = makeItemStruct(parseTree, item);
		}

		return true;
	}

	return { parse, prepareEncode, encode, makeStruct, name };
}

// CRC 32 checksumming function
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc32(name, elements) {
	return crc(name, elements, 4, crcLib.crc32);
}

// CRC 24 checksumming function
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc24(name, elements) {
	return crc(name, elements, 3, crcLib.crc24);
}

// CRC 16 checksumming function
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc16(name, elements) {
	return crc(name, elements, 2, crcLib.crc16);
}

// CRC 16 checksumming function with CCITT tables
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc16CCITT(name, elements) {
	return crc(name, elements, 2, crcLib.crc16ccitt);
}

// CRC 16 checksumming function with Modbus tables
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc16Modbus(name, elements) {
	return crc(name, elements, 2, crcLib.crc16modbus);
}

// CRC 16 checksumming function, Kermit version
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc16Kermit(name, elements) {
	return crc(name, elements, 2, crcLib.crc16kermit);
}

// CRC 16 checksumming function, XModem version
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc16XModem(name, elements) {
	return crc(name, elements, 2, crcLib.crc16xmodem);
}

// CRC 8 checksumming function
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc8(name, elements) {
	return crc(name, elements, 1, crcLib.crc8);
}

// CRC 8 checksumming function, 1 Wire version
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc81Wire(name, elements) {
	return crc(name, elements, 1, crcLib.crc81wire);
}

// CRC 8 "checksumming"" function, this one just XORs all bytes, not a real checksum
//
// name: name of the crc field in the resulting object
// elements: elements over which to calculate the checksum, the elements will be appended toplevel,
//           as if the CRC call never happened
//
// returns: parser function to calculate and validate CRC which returns true or false
function crc8XOR(name, elements) {
	return crc(name, elements, 1, crc8xor);
}

// export everything
module.exports = {
	crc,
	crc32,
	crc24,
	crc16,
	crc16CCITT,
	crc16Modbus,
	crc16Kermit,
	crc16XModem,
	crc8,
	crc81Wire,
	crc8XOR,
}
