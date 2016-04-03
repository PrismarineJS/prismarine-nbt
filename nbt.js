var zlib = require('zlib');
var fs=require("fs");
var path=require("path");
var ProtoDef=require("protodef").ProtoDef;
var compound=require("./compound").compound;


var nbtJson=fs.readFileSync(path.join(__dirname,"nbt.json"),"utf8");
var leNbtJson=nbtJson.replace(/(i[0-9]+)/g,"l$1");

function createProto(le) {
  var proto = new ProtoDef();
  proto.addType("compound",compound);
  proto.addTypes(JSON.parse(le ? leNbtJson : nbtJson));
  return proto;
}

var proto=createProto(false);
var protoLE=createProto(true);

function writeUncompressed(value,le) {
  return (le ? protoLE : proto).createPacketBuffer("nbt",value);
}

function parseUncompressed(data,le) {
  return (le ? protoLE : proto).parsePacketBuffer("nbt",data).data;
}


var hasGzipHeader = function(data){
  var result=true;
  if(data[0]!=0x1f) result=false;
  if(data[1]!=0x8b) result=false;
  return result;
};

function parse(data, le, callback) {
  var isLe=false;
  if (typeof le === "function") {
    callback=le;
  }
  else {
    isLe=le;
  }
  if (hasGzipHeader(data)) {
    zlib.gunzip(data, function(error, uncompressed) {
      if (error) {
        callback(error, data);
      } else {
        callback(null, parseUncompressed(uncompressed,isLe));
      }
    });
  } else {
    callback(null, parseUncompressed(data,isLe));
  }
}

function simplify(data)
{
  function transform(value,type)
  {
    if(type=="compound") {
      return Object.keys(value).reduce(function(acc,key){
        acc[key]=simplify(value[key]);
        return acc;
      },{});
    }
    if(type=="list") {
      return value.value.map(function(v){transform(v,value.type)});
    }
    return value;
  }
  return transform(data.value,data.type);
}

module.exports={
  writeUncompressed:writeUncompressed,
  parseUncompressed:parseUncompressed,
  simplify:simplify,
  parse:parse,
  proto:proto,
  protoLE:protoLE
};