'use strict';

var fs = require('fs'),
    nbt = require('./nbt');

describe('nbt.Reader', function() {
	it('is constructed with a buffer array', function() {
		new nbt.Reader(new Buffer([1, 2, 3]));
	});

	it('reads 8-bit bytes', function() {
		var reader = new nbt.Reader(new Buffer([0, 127, -127]));
		expect(reader.byte()).toEqual(0);
		expect(reader.byte()).toEqual(127);
		expect(reader.byte()).toEqual(-127);
	});

	it('reads 16-bit shorts', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0, 0,255, -127,255
		]));
		expect(reader.short()).toEqual(0);
		expect(reader.short()).toEqual(255);
		expect(reader.short()).toEqual((-127 << 8) | 255);
	});

	it('reads 32-bit ints', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0,0,0,
			0,0,0,255,
			-127,0,0,0
		]));
		expect(reader.int()).toEqual(0);
		expect(reader.int()).toEqual(255);
		expect(reader.int()).toEqual(-127 << 24);
	});

	it('reads 64-bit longs', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,255,
			-127,0,0,0,0,0,0,0
		]));
		expect(reader.long()).toEqual(0);
		expect(reader.long()).toEqual(255);

		/* false pass - JS only has 53 bit precision */
		expect(reader.long()).toEqual(-127 << 56);
	});

	it('reads 8-bit byte arrays', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0,0,2, 1,2,
			0,0,0,4, 3,4,5,6
		]));
		expect(reader.byteArray()).toEqual([1, 2]);
		expect(reader.byteArray()).toEqual([3, 4, 5, 6]);
	});

	it('reads 32-bit int arrays', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0,0,2, 0,0,0,1, 0,0,0,2,
			0,0,0,4, 0,0,0,3, 0,0,0,4, 0,0,0,5, 0,0,0,6,
		]));
		expect(reader.intArray()).toEqual([1, 2]);
		expect(reader.intArray()).toEqual([3, 4, 5, 6]);
	});

	it('reads strings', function() {
		var reader = new nbt.Reader(new Buffer([
			0,6,  0x48,0x65,0x6C,0x6C,0x6F,0x21,
			0,16, 0xE3,0x81,0x93,0xE3,0x82,0x93,0xE3,0x81,
			      0xAB,0xE3,0x81,0xA1,0xE3,0x81,0xAF,0x21
		]));
		expect(reader.string()).toEqual('Hello!');
		expect(reader.string()).toEqual('こんにちは!');
	});
});

describe('nbt.parse', function() {
	it('parses a compressed NBT file', function() {
		var callback = jasmine.createSpy();

		runs(function() {
			fs.readFile('sample/bigtest.nbt.gz', function(error, data) {
				if (error) {
					throw error;
				}

				nbt.parse(data, callback);
			});
		}, 500);

		waitsFor(function() {
			return callback.callCount > 0;
		}, 'the NBT file to be parsed', 750);

		runs(function() {
			var result = callback.mostRecentCall.args[1];

			expect(result.Level).toBeDefined();
			expect(result.Level.stringTest).toEqual(
				'HELLO WORLD THIS IS A TEST STRING ÅÄÖ!');
			expect(result.Level['nested compound test']).toEqual({
				ham: { name: 'Hampus', value: 0.75 },
				egg: { name: 'Eggbert', value: 0.5 }
			});
		});
	});
});
