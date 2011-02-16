var fs = require('fs'),
	nbt = require('../nbt');

fs.readFile('bigtest.nbt', function(error, data) {
	if (error) throw error;
	
	var result = nbt.parse(data);
	console.log(result.Level.stringTest);
	console.log(result.Level['nested compound test']);
});