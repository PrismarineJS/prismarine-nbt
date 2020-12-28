const zlib = require('zlib')

const { ProtoDefCompiler } = require('protodef').Compiler

const beNbtJson = JSON.stringify(require('./nbt.json'))
const leNbtJson = beNbtJson.replace(/([if][0-7]+)/g, 'l$1')
const varintJson = JSON.stringify(require('./nbt-varint.json')).replace(/([if][0-9]+)/g, 'l$1')

function createProto (type) {
  const compiler = new ProtoDefCompiler()
  compiler.addTypes(require('./compiler-compound'))
  compiler.addTypes(require('./compiler-tagname'))
  let proto = beNbtJson
  if (type === 'littleVarint') {
    compiler.addTypes(require('./compiler-zigzag'))
    proto = varintJson
  } else if (type === 'little') {
    proto = leNbtJson
  }
  compiler.addTypesToCompile(JSON.parse(proto))
  return compiler.compileProtoDefSync()
}

const protoBE = createProto('big')
const protoLE = createProto('little')
const protoVarInt = createProto('littleVarint')

const protos = {
  big: protoBE,
  little: protoLE,
  littleVarint: protoVarInt
}

function writeUncompressed (value, proto = 'big') {
  if (proto === true) proto = 'little'
  return protos[proto].createPacketBuffer('nbt', value)
}

function _parseUncompressed (data, proto = 'big') {
  if (proto === true) proto = 'little'
  return protos[proto].parsePacketBuffer('nbt', data, data.startOffset)
}

function parseUncompressed (data, proto = 'big') {
  return _parseUncompressed(data, proto).data
}

const hasGzipHeader = function (data) {
  let result = true
  if (data[0] !== 0x1f) result = false
  if (data[1] !== 0x8b) result = false
  return result
}

function parseAs (data, type) {
  return new Promise((resolve, reject) => {
    if (hasGzipHeader(data)) {
      zlib.gunzip(data, function (error, uncompressed) {
        if (error) {
          reject(error)
        } else {
          const ret = _parseUncompressed(uncompressed, type)
          ret.metadata.compressed = true
          resolve([null, ret.data, type, ret.metadata])
        }
      })
    } else {
      const ret = _parseUncompressed(data, type)
      resolve([null, ret.data, type, ret.metadata])
    }
  })
}

async function parse (data, format, callback) {
  let fmt = null
  if (typeof format === 'function') {
    callback = format
  } else if (format === true || format === 'little') {
    fmt = 'little'
  } else if (format === 'big') {
    fmt = 'big'
  } else if (format === 'littleVarint') {
    fmt = 'littleVarint'
  } else if (format) {
    throw new Error('Unrecognized format: ' + format)
  }
  if (!callback) callback = () => {}

  if (fmt) {
    return parseAs(data, fmt).then(callback)
  }

  let ret = null
  try {
    ret = await parseAs(data, 'big')
  } catch (e) {
    // console.debug('Failed read as big endian, trying le')
    try {
      ret = await parseAs(data, 'little')
    } catch (e2) {
      // console.debug('Failed read as le, trying le varint')
      try {
        ret = await parseAs(data, 'littleVarint')
      } catch (e3) {
        console.warn('Failed to read nbt')
        console.log(e)
        throw e // error decoding as big endian
      }
    }
  }

  if (ret[0]) {
    throw new Error(ret[0])
  }

  callback(...ret) // eslint-disable-line
  const [, result, type, metadata] = ret
  return { result, type, metadata }
}

function simplify (data) {
  function transform (value, type) {
    if (type === 'compound') {
      return Object.keys(value).reduce(function (acc, key) {
        acc[key] = simplify(value[key])
        return acc
      }, {})
    }
    if (type === 'list') {
      return value.value.map(function (v) { return transform(v, value.type) })
    }
    return value
  }
  return transform(data.value, data.type)
}

module.exports = {
  writeUncompressed,
  parseUncompressed,
  simplify,
  parse,
  parseAs,
  proto: protoBE,
  protoLE,
  protos
}
