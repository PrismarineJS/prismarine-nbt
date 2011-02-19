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
	var compress = require('compress'),
		binary = require('./binary');
		
	
	var tagTypes = {
		end: 0,
		byte: 1,
		short: 2,
		int: 3,
		long: 4,
		float: 5,
		double: 6,
		byteArray: 7,
		string: 8,
		list: 9,
		compound: 10
	};

	var tagTypeNames = new (function() {
		var typeName;
		for (typeName in tagTypes) {
			if (tagTypes.hasOwnProperty(typeName)) {
				this[tagTypes[typeName]] = typeName;
			}
		}
	});

	var ValueReader = function(binaryReader) {
		var intReader = function(bits) {
			return function() {
				return binaryReader.int(bits, true);
			};
		};

		var floatReader = function(precisionBits, exponentBits) {
			return function() {
				return binaryReader.float(precisionBits, exponentBits);
			};
		};
		
		this[tagTypes.byte] = intReader(8);
		this[tagTypes.short] = intReader(16);
		this[tagTypes.int] = intReader(32);
		this[tagTypes.long] = intReader(64);
		this[tagTypes.float] = floatReader(23, 8);
		this[tagTypes.double] = floatReader(52, 11);

		this[tagTypes.byteArray] = function() {
			var length = this.int();
			var bytes = [];
			var i;
			for (i = 0; i < length; i++) {
				bytes.push(this.byte());
			}
			return new Buffer(bytes);
		};

		this[tagTypes.string] = function() {
			var length = this.short();
			return binaryReader.utf8(length);
		};

		this[tagTypes.list] = function() {
			var type = this.byte();
			var length = this.int();
			var values = [];
			var i;
			for (i = 0; i < length; i++) {
				values.push(this[type]());
			}
			return values;
		};

		this[tagTypes.compound] = function() {
			var values = {};
			while (true) {
				var type = this.byte();
				if (type === tagTypes.end) {
					break;
				}
				var name = this.string();
				var value = this[type]();
				values[name] = value;
			}
			return values;
		};
		
		var typeName;
		for (typeName in tagTypes) {
			if (tagTypes.hasOwnProperty(typeName)) {
				this[typeName] = this[tagTypes[typeName]];
			}
		}
	};

	var parseUncompressed = function(data) {
		var binaryReader = new binary.BinaryReader(data, true);
		var valueReader = new ValueReader(binaryReader);
		
		var type = valueReader.byte();
		if (type !== tagTypes.compound) {
			throw 'Top tag should be a compound';
		}
		
		var name = valueReader.string();
		var result = {};
		result[name] = valueReader.compound();
		
		return result;
	}

	this.parse = function(data, callback) {
		if (compress.hasGzipHeader(data)) {
			var gunzip = new compress.Gunzip();
			gunzip.write(data, function(error, uncompressed) {
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