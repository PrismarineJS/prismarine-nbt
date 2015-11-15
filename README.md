# Prismarine-NBT
[![NPM version](https://img.shields.io/npm/v/prismarine-nbt.svg)](http://npmjs.com/package/prismarine-nbt)
[![Build Status](https://img.shields.io/circleci/project/PrismarineJS/prismarine-nbt/master.svg)](https://circleci.com/gh/PrismarineJS/prismarine-nbt)

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

## API

### writeUncompressed(value)

Returns a buffer with a serialized nbt `value`.

### parseUncompressed(data)

Takes a buffer `data` and returns a parsed nbt value.

### parse(data, callback)

Takes an optionally compressed `data` and provide a parsed nbt value in the `callback(err,value)`

### proto

Provide the protodef instance used to parse and serialize nbt.

## History

### 0.1.0
* completely reimplement using ProtoDef, the API is mostly compatible with the old version

### 0.0.1
* import from nbt.js + changes to make writing possible

## Copyright

Inspired by NBT.js, by Sijmen Mulder.

I, the copyright holder of this work, hereby release it into the public domain. This applies worldwide.

In case this is not legally possible: I grant anyone the right to use this work for any purpose, without any conditions, unless such conditions are required by law.