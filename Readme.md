# Prismarine-NBT
[![NPM version](https://img.shields.io/npm/v/prismarine-nbt.svg)](http://npmjs.com/package/prismarine-nbt)
[![Build Status](https://img.shields.io/circleci/project/PrismarineJS/prismarine-nbt/master.svg)](https://circleci.com/gh/PrismarineJS/prismarine-nbt)

Inspired by NBT.js, by Sijmen Mulder.

Prismarine-NBT is a JavaScript parser and serializer for [NBT](http://wiki.vg/NBT) archives, for use with [Node.js](http://nodejs.org/).


## Usage

After `var nbt = require('nbt')`, you can use `nbt.parse(data, callback)` to convert NBT data into a regular JavaScript object.
```js
var fs = require('fs'),
    nbt = require('nbt');

fs.readFile('bigtest.nbt', function(error, data) {
    if (error) throw error;

    nbt.parse(data, function(error, data) {
        console.log(data.value.stringTest.value);
        console.log(data.value['nested compound test'].value);
    });
});
```

If the data is gzipped, it is automatically decompressed first.

Tag names are copied verbatim, and as some names are not valid JavaScript names, use of the indexer may be required – such as with the nested compound test in the example above.

## API

### writeUncompressed(value)

Returns a buffer with a serialized nbt `value`.

### parseUncompressed(data)

Takes a buffer `data` and returns a parsed nbt value.

### parse(data, callback)

Takes an optionally compressed `data` and provide a parsed nbt value in the `callback(err,value)`

### proto

Provide the protodef instance used to parse and serialize nbt.

## Development and testing

[Grunt](http://gruntjs.com) is used as a task runner:
```bash
grunt jshint  # Check code quality
grunt test    # Run tests
grunt watch   # Do the above two on every file change
```

## Copyright

I, the copyright holder of this work, hereby release it into the public domain. This applies worldwide.

In case this is not legally possible: I grant anyone the right to use this work for any purpose, without any conditions, unless such conditions are required by law.