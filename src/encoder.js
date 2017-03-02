// Encode a binary buffer
//
// definition: array of type parser functions
// objcet: object to encode to buffer
// options:
//  - `bigEndian`: default endianness of encoder (default: `true`)
function encode(definition, object, { bigEndian = true } = {}) {
	let result = Buffer.alloc(0);

	// prepare encoding (aka update all `sizeField` and `repetitionCount` definitions)
	for (const { name, prepareEncode } of definition) {
		const data = object[name];

		prepareEncode(data, object);
	}

	for (const { encode: encodeItem, name } of definition) {
		const data = object[name];
		const r = encodeItem(data, { bigEndian });

		result = Buffer.concat([result, r]);
	}

	return result;
}

// export everything
module.exports = encode;
