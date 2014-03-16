NBT.js
======

by Sijmen Mulder.

NBT.js is a JavaScript parser [NBT](http://www.minecraft.net/docs/NBT.txt) archives, for use with [Node.js](http://nodejs.org/).

Usage
-----

After `var nbt = require('nbt')`, you can use `nbt.parse(data, callback)` to convert NBT data into a regular JavaScript object.

    var fs = require('fs'),
    	nbt = require('nbt');

    fs.readFile('bigtest.nbt', function(error, data) {
    	if (error) throw error;

		nbt.parse(data, function(error, result) {
	    	console.log(result.Level.stringTest);
	    	console.log(result.Level['nested compound test']);
		});
    });

If the data is gzipped, it is automatically decompressed first.

Tag names are copied verbatim, and as some names are not valid JavaScript names, use of the indexer may be required – such as with the nested compound test in the example above.

Byte arrays are returned as Node.js `Buffer` objects.

Known issues
------------

 * No formal test cases (only a sample program)
 * 64 bit integers overflow

Copyright
---------

I, the copyright holder of this work, hereby release it into the public domain. This applies worldwide.

In case this is not legally possible: I grant anyone the right to use this work for any purpose, without any conditions, unless such conditions are required by law.
