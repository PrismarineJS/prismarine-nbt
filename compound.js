module.exports= {
  'compound':[readCompound,writeCompound,sizeOfCompound]
};

function readCompound(buffer,offset,typeArgs,rootNode)
{
  var results = {
    value: {},
    size: 0
  };
  while (true) {
    var typ=this.read(buffer,offset,"i8",rootNode);
    if (typ.value === 0) {
      offset+=typ.size;
      results.size+=typ.size;
      break;
    }

    var readResults=this.read(buffer,offset,"nbt",rootNode);
    offset+=readResults.size;
    results.size+=readResults.size;
    results.value[readResults.value.name] = {
      type: readResults.value.type,
      value: readResults.value.value
    };
  }
  return results;
}

function writeCompound(value,buffer,offset,typeArgs,rootNode)
{
  var self=this;
  Object.keys(value).map(function (key) {
    offset=self.write({
      name:key,
      type:value[key].type,
      value:value[key].value
    },buffer,offset,"nbt",rootNode);
  });
  offset=this.write(0,buffer,offset,"i8",rootNode);

  return offset;
}

function sizeOfCompound(value,typeArgs,rootNode)
{
  var self=this;
  var size=Object.keys(value).reduce(function (size,key) {
    return size+self.sizeOf({
        name:key,
        type:value[key].type,
        value:value[key].value
      },"nbt",rootNode);
  },0);
  return 1+size;
}