'use strict';

var fs = require('fs'),
    nbt = require('../nbt'),
    expect = require('chai').expect;

describe('nbt.Writer', function() {
	it('is constructed with no arguments', function() {
		new nbt.Writer();
	});

	it('writes 8-bit bytes', function() {
		var writer = new nbt.Writer();
		expect(writer.byte(0).buffer.toString('hex')).to.deep.equal(new Buffer([0]).toString('hex'));
		expect(writer.byte(127).buffer).to.deep.equal(new Buffer([0, 127]));
		expect(writer.byte(-127).buffer).to.deep.equal(new Buffer([0, 127, -127]));
	});

	it('writes 16-bit shorts', function() {
		var writer = new nbt.Writer();
		expect(writer.short(0).buffer).to.deep.equal(new Buffer([0, 0]));
		expect(writer.short(255).buffer).to.deep.equal(new Buffer([0, 0, 0, 255]));
		expect(writer.short((-127 << 8) | 255).buffer).to.deep.equal(new Buffer([0, 0, 0, 255, -127, 255]));
	});

	it('writes 32-bit ints', function() {
		var writer = new nbt.Writer();
		expect(writer.int(0).buffer).to.deep.equal(new Buffer([0, 0, 0, 0]));
		expect(writer.int(255).buffer).to.deep.equal(new Buffer([0, 0, 0, 0, 0, 0, 0, 255]));
		expect(writer.int(-127 << 24).buffer).to.deep.equal(new Buffer([0, 0, 0, 0, 0, 0, 0, 255, -127, 0, 0, 0]));
	});

	it('writes 64-bit longs', function() {
		var writer = new nbt.Writer();
		var buffer = new Buffer([
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,255,
			-127,0,0,0,0,0,0,0
		]);
		expect(writer.long([0, 0]).buffer).to.deep.equal(buffer.slice(0, 8));
		expect(writer.long([0, 255]).buffer).to.deep.equal(buffer.slice(0, 16));
		expect(writer.long([-127 << 24, 0]).buffer).to.deep.equal(buffer);
	});

	it('writes 32-bit floats', function() {
		var writer = new nbt.Writer();
		var buffer = new Buffer([
			0x00,0x00,0x00,0x00,
			0x3f,0x80,0x00,0x00
		]);
		expect(writer.float(0).buffer).to.deep.equal(buffer.slice(0, 4));
		expect(writer.float(1).buffer).to.deep.equal(buffer);
	});

	it('writes 64-bit doubles', function() {
		var writer = new nbt.Writer();
		var buffer = new Buffer([
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x3f,0xf0,0x00,0x00,0x00,0x00,0x00,0x00
		]);
		expect(writer.double(0).buffer).to.deep.equal(buffer.slice(0, 8));
		expect(writer.double(1).buffer).to.deep.equal(buffer);
	});

	it('writes 8-bit byte arrays', function() {
		var writer = new nbt.Writer();
		var buffer = new Buffer([
			0,0,0,2, 1,2,
			0,0,0,4, 3,4,5,6
		]);
		expect(writer.byteArray(new Buffer([1, 2])).buffer).to.deep.equal(buffer.slice(0, 6));
		expect(writer.byteArray(new Buffer([3, 4, 5, 6])).buffer).to.deep.equal(buffer);
	});

	it('writes 32-bit int arrays', function() {
		var writer = new nbt.Writer();
		var buffer = new Buffer([
			0,0,0,2, 0,0,0,1, 0,0,0,2,
			0,0,0,4, 0,0,0,3, 0,0,0,4, 0,0,0,5, 0,0,0,6,
		]);
		expect(writer.intArray([1, 2]).buffer).to.deep.equal(buffer.slice(0, 12));
		expect(writer.intArray([3, 4, 5, 6]).buffer).to.deep.equal(buffer);
	});

	it('writes strings', function() {
		var writer = new nbt.Writer();
		var buffer = new Buffer([
			0,6,  0x48,0x65,0x6C,0x6C,0x6F,0x21,
			0,16, 0xE3,0x81,0x93,0xE3,0x82,0x93,0xE3,0x81,
			      0xAB,0xE3,0x81,0xA1,0xE3,0x81,0xAF,0x21
		]);
		expect(writer.string('Hello!').buffer).to.deep.equal(buffer.slice(0, 8));
		expect(writer.string('こんにちは!').buffer).to.deep.equal(buffer);
	});

	it('writes lists', function() {
		var writer = new nbt.Writer();
		var buffer = new Buffer([
			1, 0,0,0,3, 1, 2, 3,
			8, 0,0,0,2, 0,5, 0x48,0x65,0x6C,0x6C,0x6F,
			            0,5, 0x57,0x6F,0x72,0x6C,0x64
		]);
		expect(writer.list({ type: "byte", value: [1, 2, 3] }).buffer).to.deep.equal(buffer.slice(0, 8));
		expect(writer.list({ type: "string", value: ['Hello', 'World'] }).buffer).to.deep.equal(buffer);
	});

	it('writes compounds', function() {
		var writer = new nbt.Writer();
		var buffer = new Buffer([
			1, 0,2, 0x61,0x61, 1,
			9, 0,2, 0x62,0x62, 1, 0,0,0,3, 1, 2, 3,
			0,
			1, 0,2, 0x63,0x63, 2,
			0
		]);
		expect(writer.compound({
			aa: { type: "byte", value: 1 },
			bb: { type: "list", value: { type: "byte", value: [1, 2, 3] } }
		}).buffer.toString('hex')).to.deep.equal(buffer.slice(0, 20).toString('hex'));
		expect(writer.compound({
			cc: { type: "byte", value: 2 }
		}).buffer).to.deep.equal(buffer);
	});
});

describe('nbt.Reader', function() {
	it('is constructed with a buffer array', function() {
		new nbt.Reader(new Buffer([1, 2, 3]));
	});

	it('reads 8-bit bytes', function() {
		var reader = new nbt.Reader(new Buffer([0, 127, -127]));
		expect(reader.byte()).to.equal(0);
		expect(reader.byte()).to.equal(127);
		expect(reader.byte()).to.equal(-127);
	});

	it('reads 16-bit shorts', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0, 0,255, -127,255
		]));
		expect(reader.short()).to.equal(0);
		expect(reader.short()).to.equal(255);
		expect(reader.short()).to.equal((-127 << 8) | 255);
	});

	it('reads 32-bit ints', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0,0,0,
			0,0,0,255,
			-127,0,0,0
		]));
		expect(reader.int()).to.equal(0);
		expect(reader.int()).to.equal(255);
		expect(reader.int()).to.equal(-127 << 24);
	});

	it('reads 64-bit longs', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,255,
			-127,0,0,0,0,0,0,0
		]));
		expect(reader.long()).to.deep.equal([0, 0]);
		expect(reader.long()).to.deep.equal([0, 255]);
		expect(reader.long()).to.deep.equal([-127 << 24, 0]);
	});

	it('reads 32-bit floats', function() {
		var reader = new nbt.Reader(new Buffer([
			0x00,0x00,0x00,0x00,
			0x3f,0x80,0x00,0x00
		]));
		expect(reader.float()).to.equal(0);
		expect(reader.float()).to.equal(1);
	});

	it('reads 64-bit doubles', function() {
		var reader = new nbt.Reader(new Buffer([
			0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
			0x3f,0xf0,0x00,0x00,0x00,0x00,0x00,0x00
		]));
		expect(reader.double()).to.equal(0);
		expect(reader.double()).to.equal(1);
	});

	it('reads 8-bit byte arrays', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0,0,2, 1,2,
			0,0,0,4, 3,4,5,6
		]));
		expect(reader.byteArray()).to.deep.equal([1, 2]);
		expect(reader.byteArray()).to.deep.equal([3, 4, 5, 6]);
	});

	it('reads 32-bit int arrays', function() {
		var reader = new nbt.Reader(new Buffer([
			0,0,0,2, 0,0,0,1, 0,0,0,2,
			0,0,0,4, 0,0,0,3, 0,0,0,4, 0,0,0,5, 0,0,0,6,
		]));
		expect(reader.intArray()).to.deep.equal([1, 2]);
		expect(reader.intArray()).to.deep.equal([3, 4, 5, 6]);
	});

	it('reads strings', function() {
		var reader = new nbt.Reader(new Buffer([
			0,6,  0x48,0x65,0x6C,0x6C,0x6F,0x21,
			0,16, 0xE3,0x81,0x93,0xE3,0x82,0x93,0xE3,0x81,
			      0xAB,0xE3,0x81,0xA1,0xE3,0x81,0xAF,0x21
		]));
		expect(reader.string()).to.equal('Hello!');
		expect(reader.string()).to.equal('こんにちは!');
	});

	it('reads lists', function() {
		var reader = new nbt.Reader(new Buffer([
			1, 0,0,0,3, 1, 2, 3,
			8, 0,0,0,2, 0,5, 0x48,0x65,0x6C,0x6C,0x6F,
			            0,5, 0x57,0x6F,0x72,0x6C,0x64
		]));
		expect(reader.list()).to.deep.equal({ type: "byte", value: [1, 2, 3] });
		expect(reader.list()).to.deep.equal({ type: "string", value: ['Hello', 'World'] });
	});

	it('reads compounds', function() {
		var reader = new nbt.Reader(new Buffer([
			1, 0,2, 0x61,0x61, 1,
			9, 0,2, 0x62,0x62, 1, 0,0,0,3, 1, 2, 3,
			0,
			1, 0,2, 0x63,0x63, 2,
			0
		]));
		expect(reader.compound()).to.deep.equal({
			aa: { type: "byte", value: 1 },
			bb: { type: "list", value: { type: "byte", value: [1, 2, 3] } }
		});
		expect(reader.compound()).to.deep.equal({
			cc: { type: "byte", value: 2 }
		});
	});
});

describe('nbt.parse', function() {
	it('parses a compressed NBT file', function(done) {
		fs.readFile('sample/bigtest.nbt.gz', function(error, data) {
			if (error) {
				throw error;
			}
			nbt.parse(data, function(err, data) {
				if (err)
					throw error;
				expect(data.value.root).to.equal('Level');
				expect(data.value.value.stringTest.value).to.equal(
				'HELLO WORLD THIS IS A TEST STRING ÅÄÖ!');
				expect(data.value.value['nested compound test'].value).to.deep.equal({
					ham: {
						type: "compound",
						value: {
							name: { type: "string", value: "Hampus" },
							value: { type: "float", value: 0.75 }
						}
					},
					egg: {
						type: "compound",
						value: {
							name: { type: "string", value: 'Eggbert' },
							value: { type: "float", value: 0.5 }
						}
					}
				});
				done();
			});
		});
	});
});

describe('nbt.write', function() {
	it('writes an uncompressed NBT file', function(done) {
		fs.readFile('sample/bigtest.nbt', function(err, nbtdata) {
			if (err)
				throw err;
			expect(nbt.writeUncompressed(require('../sample/bigtest'))).to.deep.equal(nbtdata);
			done();
		});
	});
});
