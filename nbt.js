/*
	NBT.js - a JavaScript parser for NBT archives
	by Sijmen Mulder

	I, the copyright holder of this work, hereby release it into the public
	domain. This applies worldwide.

	In case this is not legally possible: I grant anyone the right to use this
	work for any purpose, without any conditions, unless such conditions are
	required by law.
*/

(function() {
	'use strict';

	var nbt = this;
	var zlib = require('zlib');
	var Int64 = require('node-int64');

	nbt.tagTypes = {
		'end': 0,
		'byte': 1,
		'short': 2,
		'int': 3,
		'long': 4,
		'float': 5,
		'double': 6,
		'byteArray': 7,
		'string': 8,
		'list': 9,
		'compound': 10,
		'intArray': 11
	};

	nbt.tagTypeNames = {};
	(function() {
		for (var typeName in nbt.tagTypes) {
			if (nbt.tagTypes.hasOwnProperty(typeName)) {
				nbt.tagTypeNames[nbt.tagTypes[typeName]] = typeName;
			}
		}
	})();

	var hasGzipHeader = function(data){
		var result=true;
		if(data[0]!=0x1f) result=false;
		if(data[1]!=0x8b) result=false;
		return result;
	}

	nbt.Reader = function(buffer) {
		var offset = 0;

		function read(dataType, size) {
			var val = buffer['read' + dataType](offset);
			offset += size;
			return val;
		}

		this[nbt.tagTypes.byte]   = read.bind(this, 'Int8', 1);
		this[nbt.tagTypes.short]  = read.bind(this, 'Int16BE', 2);
		this[nbt.tagTypes.int]    = read.bind(this, 'Int32BE', 4);
		this[nbt.tagTypes.float]  = read.bind(this, 'FloatBE', 4);
		this[nbt.tagTypes.double] = read.bind(this, 'DoubleBE', 8);

		this[nbt.tagTypes.long] = function() {
			var upper = this.int();
			var lower = this.int();
			return new Int64(upper, lower);
		};

		this[nbt.tagTypes.byteArray] = function() {
			var length = this.int();
			var bytes = [];
			var i;
			for (i = 0; i < length; i++) {
				bytes.push(this.byte());
			}
			return bytes;
		};

		this[nbt.tagTypes.intArray] = function() {
			var length = this.int();
			var ints = [];
			var i;
			for (i = 0; i < length; i++) {
				ints.push(this.int());
			}
			return ints;
		};

		this[nbt.tagTypes.string] = function() {
			var length = this.short();
			var val = buffer.toString('utf8', offset, offset + length);
			offset += length;
			return val;
		};

		this[nbt.tagTypes.list] = function() {
			var type = this.byte();
			var length = this.int();
			var values = [];
			var i;
			for (i = 0; i < length; i++) {
				values.push(this[type]());
			}
			return values;
		};

		this[nbt.tagTypes.compound] = function() {
			var values = {};
			while (true) {
				var type = this.byte();
				if (type === nbt.tagTypes.end) {
					break;
				}
				var name = this.string();
				var value = this[type]();
				values[name] = value;
			}
			return values;
		};

		var typeName;
		for (typeName in nbt.tagTypes) {
			if (nbt.tagTypes.hasOwnProperty(typeName)) {
				this[typeName] = this[nbt.tagTypes[typeName]];
			}
		}
	};

	var parseUncompressed = function(data) {
		var buffer = new Buffer(data);
		var reader = new nbt.Reader(buffer);

		var type = reader.byte();
		if (type !== nbt.tagTypes.compound) {
			throw new Error('Top tag should be a compound');
		}

		var name = reader.string();
		var value = reader.compound();

		if (name === '') {
			return value;
		} else {
			var result = {};
			result[name] = value;
			return result;
		}
	}

	this.parse = function(data, callback) {
		if (hasGzipHeader(data)) {
			zlib.gunzip(data, function(error, uncompressed) {
				if (error) {
					callback(error, data);
				} else {
					callback(null, parseUncompressed(uncompressed));
				}
			});
		} else {
			callback(null, parseUncompressed(data));
		}
	};
}).apply(exports || (nbt = {}));
