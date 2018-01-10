// a delimited string type for bin-grammar: parse a string delimited by the given terminator
// 'inclusive' has the following semantics:
//      PARSE:      true: delimiter is included in string returned
//                  false: delim. not included in return & is silently consumed
//
//      ENCODE:     true: provided string must end with delimiter
//                  false: any provided string has delimiter silently appended
function delimString(name,
    {
        encoding = 'ascii',
        delimiter = '\r\n',
        inclusive = false,
        transform = value => value,
        reverseTransform = value => value
    } = {}
) {
    var extractor;

    if(delimiter instanceof Buffer) {
        extractor = delimiter;
    }
    else if(typeof delimiter === 'string') {
        extractor = new Buffer(delimiter, encoding);
    } else {
        extractor = new Buffer(delimiter);
    }

    //console.log("Extractor: ", extractor);

    function parse(buffer, parseTree, { bigEndian: inheritBigEndian }) {
        var d = buffer.indexOf(extractor);
        //console.log("d: ", d);

        if(d >= 0) {
            var size = inclusive ? (d + extractor.length) : d;
            var outb = buffer.slice(0, size);

            //console.log("size: ", size);
            //console.log("ret: ", outb.toString(encoding));
            //console.log("ret': ", transform(outb.toString(encoding)));

            return {
                value: transform(outb.toString(encoding)),
                size: d + extractor.length
            };
        } else {
            return {
                value: null,
                size: 0
            }
        }
    }

    function prepareEncode(object, parseTree, { bigEndian }) {
    }

    function encode(object, { bigEndian }) {
        var encoded = Buffer.from(reverseTransform(object), encoding);

        if(!inclusive) {
            return Buffer.concat([encoded, extractor])
        } else {
            if(encoded.indexOf(extractor) != (encoded.length - extractor.length)) {
                throw new Error('string does not end in delimiter');
            }
            return encoded;
        }
    }

    function makeStruct() {
        return reverseTransform('');
    }

    return { parse, prepareEncode, encode, makeStruct, name };
}

module.exports = delimString;
