module.exports= {
  'compound':[readCompound,writeCompound]
};

function readCompound(read)
{
  var value={};
  var self=this;
  function next()
  {
    return self.read(function(count){return read(count,true)},"byte")
        .then(function(typ){
          if(typ == 0) {
            return self.read(read,"byte").then(function(){return undefined;});
          }
          return self.read(read,"nbt")
          .then(function(val) {
            value[val.name]={
              type:val.type,
              value:val.value
            };
          })
          .then(next);
        })
  }
  return next().then(function(){ return value});
}

function writeCompound(value,write)
{
  var self=this;
  Object.keys(value).map(function (key) {
    self.write({
      name:key,
      type:value[key].type,
      value:value[key].value
    },write,"nbt");
  });
  this.write(0,write,"byte");
}
