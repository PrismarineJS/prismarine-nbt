'use strict';

var fs = require('fs'),
    nbt = require('./nbt');

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
