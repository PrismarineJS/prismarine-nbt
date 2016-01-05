var zlib = require('zlib');

var hasGzipHeader = function(data){
  var result=true;
  if(data[0]!=0x1f) result=false;
  if(data[1]!=0x8b) result=false;
  return result;
};

var ProtoDef=require("protodef").ProtoDef;
var proto=new ProtoDef();

proto.addType("compound",require("./compound").compound);
proto.addTypes(require("./nbt.json"));

function writeUncompressed(value) {
  return proto.createBuffer(value,"nbt");
}

function parseUncompressed(data,callback) {
  proto.readBuffer(data,"nbt").then(function(packet){
    callback(null,packet);
  })
  .catch(function(err){
    callback(err);
  });
}

function parse(data, callback) {
  if (hasGzipHeader(data)) {
    zlib.gunzip(data, function(error, uncompressed) {
      if (error) {
        callback(error, data);
      } else {
        parseUncompressed(uncompressed,callback);
      }
    });
  } else {
    parseUncompressed(data,callback);
  }
}

module.exports={
  writeUncompressed:writeUncompressed,
  parseUncompressed:parseUncompressed,
  parse:parse,
  proto:proto
};