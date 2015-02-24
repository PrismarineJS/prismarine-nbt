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

    nbt.Writer = function() {
		this.buffer = new Buffer(0);
		var _offset = 0;
		Object.defineProperty(this, "offset", {
			get: function() { return _offset; },
			set: function(newval) {
				_offset = newval;
				var newBuf = new Buffer(_offset);
				this.buffer.copy(newBuf);
				this.buffer = newBuf;
			}
		});
		function write(dataType, size, value) {
			var oldoffset = this.offset;
			this.offset += size;
			this.buffer['write' + dataType](value, oldoffset);
			return this;
		}

		this[nbt.tagTypes.byte]   = write.bind(this, 'Int8', 1);
		this[nbt.tagTypes.short]  = write.bind(this, 'Int16BE', 2);
		this[nbt.tagTypes.int]    = write.bind(this, 'Int32BE', 4);
		this[nbt.tagTypes.float]  = write.bind(this, 'FloatBE', 4);
		this[nbt.tagTypes.double] = write.bind(this, 'DoubleBE', 8);

		this[nbt.tagTypes.long] = function(value) {
			this.int(value[0]);
			this.int(value[1]);
			return this;
		};

		this[nbt.tagTypes.byteArray] = function(value) {
			this.int(value.length);
			var oldoffset = this.offset;
			this.offset += value.length;
			value.copy(this.buffer, oldoffset);
			return this;
		};

		this[nbt.tagTypes.intArray] = function(value) {
			this.int(value.length);
			var i;
			for (i = 0; i < value.length; i++) {
				this.int(value[i]);
			}
			return this;
		};

		this[nbt.tagTypes.string] = function(value) {
			function byteLength(str) {
				// returns the byte length of an utf8 string
				var s = str.length;
				for (var i=str.length-1; i>=0; i--) {
					var code = str.charCodeAt(i);
					if (code > 0x7f && code <= 0x7ff) s++;
					else if (code > 0x7ff && code <= 0xffff) s+=2;
					if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
				}
				return s;
			}
			var len = byteLength(value);
			this.short(len);
			var oldoffset = this.offset;
			this.offset += len
			this.buffer.write(value, oldoffset);
			return this;
		};

		this[nbt.tagTypes.list] = function(value) {
			this.byte(nbt.tagTypes[value.type]);
			this.int(value.value.length);
			var i;
			for (i = 0; i < value.value.length; i++) {
				this[value.type](value.value[i]);
			}
			return this;
		};

		this[nbt.tagTypes.compound] = function(value) {
			var self = this;
			Object.keys(value).map(function (key) {
				self.byte(nbt.tagTypes[value[key].type]);
				self.string(key);
				self[value[key].type](value[key].value);
			});
			this.byte(nbt.tagTypes.end);
			return this;
		};

		var typeName;
		for (typeName in nbt.tagTypes) {
			if (nbt.tagTypes.hasOwnProperty(typeName)) {
				this[typeName] = this[nbt.tagTypes[typeName]];
			}
		}

    }
	nbt.Reader = function(buffer) {
		this.offset = 0;

		function read(dataType, size) {
			var val = buffer['read' + dataType](this.offset);
			this.offset += size;
			return val;
		}

		this[nbt.tagTypes.byte]   = read.bind(this, 'Int8', 1);
		this[nbt.tagTypes.short]  = read.bind(this, 'Int16BE', 2);
		this[nbt.tagTypes.int]    = read.bind(this, 'Int32BE', 4);
		this[nbt.tagTypes.float]  = read.bind(this, 'FloatBE', 4);
		this[nbt.tagTypes.double] = read.bind(this, 'DoubleBE', 8);

		this[nbt.tagTypes.long] = function() {
			return [this.int(), this.int()];
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
			var val = buffer.toString('utf8', this.offset, this.offset + length);
			this.offset += length;
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
			return { type: nbt.tagTypeNames[type], value: values };
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
				values[name] = { type: nbt.tagTypeNames[type], value: value };
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

	var writeUncompressed = this.writeUncompressed = function(value) {
		var writer = new nbt.Writer();

		writer.byte(nbt.tagTypes.compound);
		writer.string(value.root);
		writer.compound(value.value);
		return writer.buffer;
	}

	var parseUncompressed = this.parseUncompressed = function(data) {
		var buffer = new Buffer(data);
		var reader = new nbt.Reader(buffer);

		var type = reader.byte();
		if (type !== nbt.tagTypes.compound) {
			throw new Error('Top tag should be a compound');
		}

		var name = reader.string();
		var value = reader.compound();

		var result = { size: reader.offset, value: { root: name, value: value } };
		return result;
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
