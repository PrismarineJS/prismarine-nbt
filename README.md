# Prismarine-NBT
[![NPM version](https://img.shields.io/npm/v/prismarine-nbt.svg)](http://npmjs.com/package/prismarine-nbt)
[![Build Status](https://github.com/PrismarineJS/prismarine-nbt/workflows/CI/badge.svg)](https://github.com/PrismarineJS/prismarine-nbt/actions?query=workflow%3A%22CI%22)

Prismarine-NBT is a JavaScript parser and serializer for [NBT](http://wiki.vg/NBT) archives, for use with [Node.js](http://nodejs.org/). It supports big, little, and little-varint encoded NBT files.


## Usage

#### as a async promise

```js
const fs = require('fs')
const { parse, writeUncompressed } = require('prismarine-nbt')

async function main(file) {
    const buffer = await fs.promises.readFile(file)
    const { parsed, type } = await parse(buffer)
    const json = JSON.stringify(result, null, 2)
    console.log('JSON serialized:', json)

    // Write it back 
    const outBuffer = fs.createWriteStream('file.nbt')
    const newBuf = writeUncompressed(result, type)
    outBuffer.write(newBuf)
    outBuffer.end(() => console.log('written!'))
}

main(process.argv[2])
```

#### as a callback

```js
var fs = require('fs'),
    nbt = require('prismarine-nbt');

fs.readFile('bigtest.nbt', function(error, data) {
    if (error) throw error;

    nbt.parse(data, function(error, data) {
        console.log(data.value.stringTest.value);
        console.log(data.value['nested compound test'].value);
    });
});
```

If the data is gzipped, it is automatically decompressed, for the buffer see metadata.buffer

## API

### parse(data, [format]): Promise<{ parsed, type, metadata: { size, buffer? } }>
### parse(data, [format,] callback)

Takes an optionally compressed `data` buffer and reads the nbt data.

If the endian `format` is known, it can be specified as 'big', 'little' or 'littleVarint'. If not specified, the library will
try to sequentially load as big, little and little varint until the parse is successful. The deduced type is returned as `type`.

Minecraft Java Edition uses big-endian format, and Bedrock uses little-endian.

### writeUncompressed(value, format='big')

Returns a buffer with a serialized nbt `value`. 

### parseUncompressed(data, format='big')

Takes a buffer `data` and returns a parsed nbt value.


### simplify(nbt)

Returns a simplified nbt representation : keep only the value to remove one level.
This loses the types so you cannot use the resulting representation to write it back to nbt.

### protos : { big, little, littleVarint }

Provides compiled protodef instances used to parse and serialize nbt

### proto

Provide the big-endian protodef instance used to parse and serialize nbt.

### protoLE

Provide the little-endian protodef instance used to parse and serialize little endian nbt.
