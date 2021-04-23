const zlib = require('zlib')

const { ProtoDefCompiler } = require('protodef').Compiler

const beNbtJson = JSON.stringify(require('./nbt.json'))
const leNbtJson = beNbtJson.replace(/([if][0-7]+)/g, 'l$1')
const varintJson = JSON.stringify(require('./nbt-varint.json')).replace(/([if][0-7]+)/g, 'l$1')

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

function parseUncompressed (data, proto = 'big') {
  if (proto === true) proto = 'little'
  return protos[proto].parsePacketBuffer('nbt', data, data.startOffset).data
}

const hasGzipHeader = function (data) {
  let result = true
  if (data[0] !== 0x1f) result = false
  if (data[1] !== 0x8b) result = false
  return result
}

const hasBedrockLevelHeader = (data) =>
  data[1] === 0 && data[2] === 0 && data[3] === 0

async function parseAs (data, type) {
  if (hasGzipHeader(data)) {
    data = await new Promise((resolve, reject) => {
      zlib.gunzip(data, (error, uncompressed) => {
        if (error) reject(error)
        else resolve(uncompressed)
      })
    })
  }
  const parsed = protos[type].parsePacketBuffer('nbt', data, data.startOffset)
  parsed.metadata.buffer = data
  parsed.type = type
  return parsed
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

  data.startOffset = data.startOffset || 0

  if (!fmt && !data.startOffset) {
    if (hasBedrockLevelHeader(data)) { // bedrock level.dat header
      data.startOffset += 8 // skip + 8 bytes
      fmt = 'little'
    }
  }

  // if the format is specified, parse
  if (fmt) {
    try {
      const res = await parseAs(data, fmt)
      if (callback) callback(null, res.data, res.type, res.metadata)
      return { parsed: res.data, type: res.type, metadata: res.metadata }
    } catch (e) {
      if (callback) return callback(e)
      else throw e
    }
  }

  // else try to deduce file type

  // Check if we decoded properly: the EOF should match end of the buffer,
  // or there should be more tags to read, else throw unexpected EOF
  const verifyEOF = ({ buffer, size }) => {
    const readLen = size
    const bufferLen = buffer.length - buffer.startOffset
    const lastByte = buffer[readLen + buffer.startOffset]
    const nextNbtTag = lastByte === 0x0A
    if (readLen < bufferLen && !nextNbtTag) {
      throw new Error(`Unexpected EOF at ${readLen}: still have ${bufferLen - readLen} bytes to read !`)
    }
  }

  // Try to parse as all formats until something passes
  let ret = null
  try {
    ret = await parseAs(data, 'big')
    verifyEOF(ret.metadata)
  } catch (e) {
    try {
      ret = await parseAs(data, 'little')
      verifyEOF(ret.metadata)
    } catch (e2) {
      try {
        ret = await parseAs(data, 'littleVarint')
        verifyEOF(ret.metadata)
      } catch (e3) {
        if (callback) return callback(e)
        else throw e // throw error decoding as big endian
      }
    }
  }

  if (callback) callback(null, ret.data, ret.type, ret.metadata)
  return { parsed: ret.data, type: ret.type, metadata: ret.metadata }
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

function getType (x) {
  switch (typeof x) {
    case 'number':
      if (Number.isInteger(x)) return 'int'
      return 'double'

    case 'string':
      if (/^\d+b$/.test(x)) return 'byte'
      if (/^\d+L$/.test(x)) return 'long'
      if (/^\d+(\.\d+)?F$/.test(x)) return 'float'
      if (/^\d+(\.\d+)?d$/.test(x)) return 'double'
    case 'boolean':
      return 'string'

    case 'object':
      if (Array.isArray(x)) return 'list'
      return 'compound'
  }
}

function parseJsObject (obj) {
  function parse (value) {
    const type = getType(value)
    switch (type) {
      case 'double':
        if (typeof value === 'number') return { type: type, value }
      case 'float':
      case 'byte':
        return { type, value: value.slice(0, -1) }

      case 'long':
        return { type, value: [0, value.slice(0, -1)] }

      case 'int':
        return { type, value }
      case 'string':
        return { type, value: value.toString() }
      case 'compound':
        return parseJsObject(value)
      case 'list':
        if (value.length === 0) {
          return { type, value: { type: 'end', value: [] } }
        }
        const parsed = value.map(parse)
        return { type, value: { type: parsed[0].type, value: parsed.map(data => data.value) } }
    }
  }
  const compound = { type: 'compound', value: {} }
  for (const key in obj) {
    compound.value[key] = parse(obj[key])
  }
  return compound
}

function writeJsObject (obj, format) {
  const parsed = parseJsObject(obj)
  parsed.name = ''
  return writeUncompressed(parsed, format)
}

module.exports = {
  writeUncompressed,
  writeJsObject,
  parseUncompressed,
  simplify,
  hasBedrockLevelHeader,
  parse,
  parseAs,
  parseJsObject,
  proto: protoBE,
  protoLE,
  protos
}
