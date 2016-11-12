'use strict';

var fs = require('fs'),
  nbt = require('./nbt');

fs.readFile('hello_world.nbt', function (error, data) {
  if (error) {
    throw error;
  }

  nbt.parse(data, function (error, result) {
    console.log(nbt.simplify(result));
  });
});
