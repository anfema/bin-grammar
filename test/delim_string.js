const test = require('ava');
const { parse, encode, binString, uint8, asciiFloat, asciiInteger, delimString } = require('../index');


test('delimstring_parse_string_delimiter_should_parse_an_exclusive_string', (t) => {
    var s = "Hello World!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: false
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
});

test('delimstring_parse_string_delimiter_should_parse_an_inclusive_string', (t) => {
    var s = "Hello World!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
});

test('delimstring_parse_string_delimiter_should_parse_an_exclusive_string_with_detritus', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: false
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
});

test('delimstring_parse_string_delimiter_should_parse_an_inclusive_string_with_detritus', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
});

test('delimstring_parse_string_delimiter_should_parse_an_exclusive_string_followed_by_another_string', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: false
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
});

test('delimstring_parse_string_delimiter_should_parse_an_inclusive_string_followed_by_another_string', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
});

test('delimstring_parse_string_delimiter_should_parse_two_exclusive_strings', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: false
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: false
        }),
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
    t.is(result.bar, "Badgers are ferocious!");
});

test('delimstring_parse_string_delimiter_should_parse_two_inclusive_strings', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: true
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
    t.is(result.bar, "Badgers are ferocious!\r\n");
});




test('delimstring_parse_buffer_delimiter_should_parse_an_exclusive_string', (t) => {
    var s = "Hello World!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: false
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
});

test('delimstring_parse_buffer_delimiter_should_parse_an_inclusive_string', (t) => {
    var s = "Hello World!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
});

test('delimstring_parse_buffer_delimiter_should_parse_an_exclusive_string_with_detritus', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: false
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
});

test('delimstring_parse_buffer_delimiter_should_parse_an_inclusive_string_with_detritus', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
});

test('delimstring_parse_buffer_delimiter_should_parse_an_exclusive_string_followed_by_another_string', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: false
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
});

test('delimstring_parse_buffer_delimiter_should_parse_an_inclusive_string_followed_by_another_string', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
});

test('delimstring_parse_buffer_delimiter_should_parse_two_exclusive_strings', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: false
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: false
        }),

    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
    t.is(result.bar, "Badgers are ferocious!");
});

test('delimstring_parse_buffer_delimiter_should_parse_two_inclusive_strings', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: true
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
    t.is(result.bar, "Badgers are ferocious!\r\n");
});


test('delimstring_parse_array_delimiter_should_parse_an_exclusive_string', (t) => {
    var s = "Hello World!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: false
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
});

test('delimstring_parse_array_delimiter_should_parse_an_inclusive_string', (t) => {
    var s = "Hello World!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
});

test('delimstring_parse_array_delimiter_should_parse_an_exclusive_string_with_detritus', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0xa],
            inclusive: false
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
});

test('delimstring_parse_array_delimiter_should_parse_an_inclusive_string_with_detritus', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
});

test('delimstring_parse_array_delimiter_should_parse_an_exclusive_string_followed_by_another_string', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: false
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
});

test('delimstring_parse_array_delimiter_should_parse_an_inclusive_string_followed_by_another_string', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
});

test('delimstring_parse_array_delimiter_should_parse_two_exclusive_strings', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: false
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: false
        }),

    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!");
    t.is(result.bar, "Badgers are ferocious!");
});

test('delimstring_parse_array_delimiter_should_parse_two_inclusive_strings', (t) => {
    var s = "Hello World!\r\nBadgers are ferocious!\r\n";
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: true
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: true
        })
    ];

    var result = parse(g, new Buffer(s));

    t.is(result.foo, "Hello World!\r\n");
    t.is(result.bar, "Badgers are ferocious!\r\n");
});



test('delimstring_encode_string_delimiter_should_encode_an_exclusive_string', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: false
        })
    ];

    var result = encode(g, { foo: 'Hello World!' });

    t.deepEqual(result, new Buffer("Hello World!\r\n"));
});

test('delimstring_encode_string_delimiter_should_encode_an_inclusive_string', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: true
        })
    ];

    var result = encode(g, { foo: 'Hello World!\r\n' });

    t.deepEqual(result, new Buffer("Hello World!\r\n"));
});

test('delimstring_encode_string_delimiter_should_encode_two_exclusive_strings', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: false
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: false
        }),
    ];

    var result = encode(g, {
        foo: 'Hello World!',
        bar: 'Badgers are ferocious!'
    });

    t.deepEqual(result, new Buffer("Hello World!\r\nBadgers are ferocious!\r\n"));
});

test('delimstring_encode_string_delimiter_should_encode_two_inclusive_strings', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: true
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: '\r\n',
            inclusive: true
        }),
    ];

    var result = encode(g, {
        foo: 'Hello World!\r\n',
        bar: 'Badgers are ferocious!\r\n'
    });

    t.deepEqual(result, new Buffer("Hello World!\r\nBadgers are ferocious!\r\n"));
});

test('delimstring_encode_buffer_delimiter_should_encode_an_exclusive_string', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: false
        })
    ];

    var result = encode(g, { foo: 'Hello World!' });

    t.deepEqual(result, new Buffer("Hello World!\r\n"));
});

test('delimstring_encode_buffer_delimiter_should_encode_an_inclusive_string', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: true
        })
    ];

    var result = encode(g, { foo: 'Hello World!\r\n' });

    t.deepEqual(result, new Buffer("Hello World!\r\n"));
});

test('delimstring_encode_buffer_delimiter_should_encode_two_exclusive_strings', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: false
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: false
        }),
    ];

    var result = encode(g, {
        foo: 'Hello World!',
        bar: 'Badgers are ferocious!'
    });

    t.deepEqual(result, new Buffer("Hello World!\r\nBadgers are ferocious!\r\n"));
});

test('delimstring_encode_buffer_delimiter_should_encode_two_inclusive_strings', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: true
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: new Buffer("\r\n"),
            inclusive: true
        }),
    ];

    var result = encode(g, {
        foo: 'Hello World!\r\n',
        bar: 'Badgers are ferocious!\r\n'
    });

    t.deepEqual(result, new Buffer("Hello World!\r\nBadgers are ferocious!\r\n"));
});

test('delimstring_encode_array_delimiter_should_encode_an_exclusive_string', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: false
        })
    ];

    var result = encode(g, { foo: 'Hello World!' });

    t.deepEqual(result, new Buffer("Hello World!\r\n"));
});

test('delimstring_encode_array_delimiter_should_encode_an_inclusive_string', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: true
        })
    ];

    var result = encode(g, { foo: 'Hello World!\r\n' });

    t.deepEqual(result, new Buffer("Hello World!\r\n"));
});

test('delimstring_encode_array_delimiter_should_encode_two_exclusive_strings', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: false
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: false
        }),
    ];

    var result = encode(g, {
        foo: 'Hello World!',
        bar: 'Badgers are ferocious!'
    });

    t.deepEqual(result, new Buffer("Hello World!\r\nBadgers are ferocious!\r\n"));
});

test('delimstring_encode_array_delimiter_should_encode_two_inclusive_strings', (t) => {
    var g = [
        delimString('foo', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: true
        }),
        delimString('bar', {
            encoding: 'ascii',
            delimiter: [0x0d, 0x0a],
            inclusive: true
        }),
    ];

    var result = encode(g, {
        foo: 'Hello World!\r\n',
        bar: 'Badgers are ferocious!\r\n'
    });

    t.deepEqual(result, new Buffer("Hello World!\r\nBadgers are ferocious!\r\n"));
});

