const ProtoDef = require('protodef').ProtoDef
const { performance } = require('perf_hooks')
const assert = require('assert')
const { ProtoDefCompiler } = require('protodef').Compiler
const fs = require('fs')
const nbt = require('../nbt')

const mainType = 'nbt'

function main (nbTests = 10000) {
  const buffer = fs.readFileSync(__dirname + '/../sample/bigtest.nbt') // eslint-disable-line n/no-path-concat
  const validate = true
  const proto = new ProtoDef(validate)
  nbt.addTypesToInterpreter('big', proto)

  const compiler = new ProtoDefCompiler()
  nbt.addTypesToCompiler('big', compiler)
  const compiledProto = compiler.compileProtoDefSync()

  const result = compiledProto.parsePacketBuffer(mainType, buffer).data
  const result2 = proto.parsePacketBuffer(mainType, buffer).data

  const buffer2 = compiledProto.createPacketBuffer(mainType, result)
  const result3 = proto.parsePacketBuffer(mainType, buffer2).data

  assert.deepStrictEqual(result, result2)
  assert.deepStrictEqual(result2, result3)
  assert.strictEqual(buffer.length, buffer2.length)

  console.log('Running ' + nbTests + ' tests')

  let start, time, ps

  start = performance.now()
  for (let i = 0; i < nbTests; i++) {
    const result = compiledProto.parsePacketBuffer(mainType, buffer).data
    compiledProto.createPacketBuffer(mainType, result)
  }
  time = performance.now() - start
  ps = nbTests / time
  console.log('read / write compiled: ' + time.toFixed(2) + ' ms (' + ps.toFixed(2) + 'k packet/s)')

  start = performance.now()
  for (let i = 0; i < nbTests; i++) {
    const result = proto.parsePacketBuffer(mainType, buffer).data
    proto.createPacketBuffer(mainType, result)
  }
  time = performance.now() - start
  ps = nbTests / time
  console.log('read / write parser: ' + time.toFixed(2) + ' ms (' + ps.toFixed(2) + 'k packet/s)')

  // Closure optimized:
  const optimizedProto = compiler.compileProtoDefSync({ optimize: true })
  start = performance.now()
  for (let i = 0; i < nbTests; i++) {
    const result = optimizedProto.parsePacketBuffer(mainType, buffer).data
    optimizedProto.createPacketBuffer(mainType, result)
  }
  time = performance.now() - start
  ps = nbTests / time
  console.log('read / write compiled (+closure): ' + time.toFixed(2) + ' ms (' + ps.toFixed(2) + 'k packet/s)')
}

module.exports = main
if (!module.parent) main()
