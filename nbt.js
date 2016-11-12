var zlib = require('zlib');

var hasGzipHeader = function (data) {
  var result = true;
  if (data[0] != 0x1f) result = false;
  if (data[1] != 0x8b) result = false;
  return result;
};

var ProtoDef = require('protodef').ProtoDef;
var proto = new ProtoDef();

proto.addType('compound', require('./compound').compound);
proto.addTypes(require('./nbt.json'));

function writeUncompressed (value) {
  return proto.createPacketBuffer('nbt', value);
}

function parseUncompressed (data) {
  return proto.parsePacketBuffer('nbt', data).data;
}

function parse (data, callback) {
  if (hasGzipHeader(data)) {
    zlib.gunzip(data, function (error, uncompressed) {
      if (error) {
        callback(error, data);
      } else {
        callback(null, parseUncompressed(uncompressed));
      }
    });
  } else {
    callback(null, parseUncompressed(data));
  }
}

function simplify (data) {
  function transform (value, type) {
    if (type == 'compound') {
      return Object.keys(value).reduce(function (acc, key) {
        acc[key] = simplify(value[key]);
        return acc;
      }, {});
    }
    if (type == 'list') {
      return value.value.map(function (v) { return transform(v, value.type); });
    }
    return value;
  }
  return transform(data.value, data.type);
}

module.exports = {
  writeUncompressed: writeUncompressed,
  parseUncompressed: parseUncompressed,
  simplify: simplify,
  parse: parse,
  proto: proto
};
