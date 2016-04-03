var fs = require('fs'),
  nbt = require('../nbt');

fs.readFile('level.dat', function(error, data) {
  if (error) {
    throw error;
  }

  nbt.parse(data, true, function(error, result) {
    console.log(JSON.stringify(result,null,2));
  });
});
