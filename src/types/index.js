const { Binary, BCD } = require('./binary');
const BitMask = require('./bitmask');
const BitStruct = require('./bitstruct');
const Enum = require('./enum');
const { Float, Double } = require('./float');
const { Int, Int8, Int16, Int32 } = require('./int');
const Magic = require('./magic');
const BinString = require('./string');
const { UInt, UInt8, UInt16, UInt32 } = require('./uint');
const Loop = require('./loop');
const Selector = require('./selector');

module.exports = {
	Binary, BCD,
	BitMask,
	BitStruct,
	Enum,
	Float, Double,
	Int, Int8, Int16, Int32,
	Magic,
	BinString,
	UInt, UInt8, UInt16, UInt32,
	Loop,
	Selector,
};


// TODO:
//
// - BitStruct
// - CRCs
