'use strict';

var fs = require('fs'),
	nbt = require('../nbt');

fs.readFile('bigtest.nbt.gz', function(error, data) {
	if (error) {
		throw error;
	}

	nbt.parse(data, function(error, result) {
		console.log(result.value.stringTest);
		console.log(JSON.stringify(result.value['nested compound test'],null,2));
	});
});
