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
  if (type === 'little-varint') {
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
const protoVarInt = createProto('little-varint')

const protos = {
  big: protoBE,
  little: protoLE,
  'little-varint': protoVarInt
}

function writeUncompressed (value, proto = 'big') {
  if (proto === true) proto = 'little'
  proto = proto === true ? proto = 'little' : proto
  // console.log('Creating uncompressed', value, proto)
  return protos[proto].createPacketBuffer('nbt', value)
}

function parseUncompressed (data, proto = 'big') {
  if (proto === true) proto = 'little'
  // console.log('Reading uncompressed', data, proto)
  return protos[proto].parsePacketBuffer('nbt', data, data.startOffset)
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
          const ret = parseUncompressed(uncompressed, type)
          resolve([null, ret.data, type, ret.metadata])
        }
      })
    } else {
      const ret = parseUncompressed(data, type)
      resolve([null, ret.data, type, ret.metadata])
    }
  })

  // We can't execute callback here, otherwise errors
  // in the callback will break fallback detection
}

async function parse (data, format, callback) {
  // console.log('A0', data, format, callback)

  let fmt = null
  if (typeof format === 'function') {
    callback = format
  } else if (format === true || format === 'little') {
    fmt = 'little'
  } else if (format === 'big') {
    fmt = 'big'
  } else if (format === 'little-varint') {
    fmt = 'little-varint'
  } else if (format) {
    throw new Error('Unrecognized format: ' + format)
  }
  if (!callback) callback = () => {}

  if (fmt) {
    // console.log('Read as', fmt)
    return parseAs(data, fmt).then(callback)
  }

  // let didCallback = false
  // const callbackOnce = (args) => {
  //   // if (!didCallback) callback(...args)
  //   didCallback = true
  // }

  // console.log('Parsing')
  // return parseAs(data, 'big')
  //   .catch(e0 => parseAs(data, 'little-varint')
  //     .catch(e1 => parseAs(data, 'little')
  //       .catch(e2 => {
  //         console.warn('Failed to read as big endian');
  //         throw e0 // return first error reading as BE
  //       }).then(callbackOnce)
  //     ).then(callbackOnce)
  //   ).then(callbackOnce)
  //   .finally('SHOULD GET CALLED!')

  let ret = null
  try {
    ret = await parseAs(data, 'big')
  } catch (e) {
    // console.debug('Failed read as big endian, trying le')
    try {
      ret = await parseAs(data, 'little')
    } catch (e2) {
      // console.debug('Failed read as le varint, trying le')
      try {
        ret = await parseAs(data, 'little-varint')
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

function parseAsync (data, format) {
  return new Promise(resolve => parse(data, format, (...args) => resolve(args)))
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
  parseAsync,
  proto: protoBE,
  protoLE,
  protos
}
