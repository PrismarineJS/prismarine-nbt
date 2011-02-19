var fs = require('fs'),
	nbt = require('../nbt');

fs.readFile('bigtest.nbt.gz', function(error, data) {
	if (error) throw error;
	
	nbt.parse(data, function(error, result) {
    	console.log(result.Level.stringTest);
    	console.log(result.Level['nested compound test']);
	});
});