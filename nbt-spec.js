'use strict';

var fs = require('fs'),
    nbt = require('./nbt');

describe('nbt.parse', function() {
	it('parses a compressed NBT file', function() {
		runs(function() {
			fs.readFile('sample/bigtest.nbt.gz', function(error, data) {
				if (error) {
					throw error;
				}

				nbt.parse(data, function(error, result) {
					expect(result.Level).toBeDefined();
					expect(result.Level.stringTest).toEqual(
						'HELLO WORLD THIS IS A TEST STRING ÅÄÖ!');
					expect(result.level.nestedCompoundTest).toEqual({
						ham: { name: 'Hampus', value: 0.75 },
						egg: { name: 'Eggbert', value: 0.5 }
					});
				});
			});
		}, 500);
	});
});
