'use strict';

var fs = require('fs'),
  nbt = require('./nbt');

fs.readFile('bigtest.nbt', function (error, data) {
  if (error) {
    throw error;
  }

  nbt.parse(data, function (error, result) {
    console.log(result);
    //console.log(nbt.simplify(result));
  });
});
