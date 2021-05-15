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

### writeJsObject(object, format='big')

Takes a javascript object, convert it to the nbt format and return a buffer of the serialized nbt.

See [parseJSObject()](#parseJsObject(object)) for the conversion.

### parseJsObject(object)

Takes a javascript object and convert it to the nbt format.

To convert the object the function need to know the targeted nbt type. 

js string ➔ NBTString

js boolean ➔ NBTString

js int (that has no decimal part) ➔ NBTInteger

js int with decimal part (**note that if you type 600.0 it'll be detected as NBTInteger because javascript handle it as 600**) ➔ NBTDouble

js string ending with d ➔ NBTDouble

js string ending with F ➔ NBTFloat

js string ending with L ➔ NBTLong

js string ending with b ➔ NBTByte

js array ➔ NBTList

js object ➔ NBTCompound
### protos : { big, little, littleVarint }

Provides compiled protodef instances used to parse and serialize nbt

### proto

Provide the big-endian protodef instance used to parse and serialize nbt.

### protoLE

Provide the little-endian protodef instance used to parse and serialize little endian nbt.
