/* eslint-env mocha */

'use strict'

const { ProtoDef } = require('protodef')
const expect = require('chai').expect
const nbt = require('../nbt')
const mutf8 = require('../mutf8')

// Bytes from Java's DataOutputStream.writeUTF, which Minecraft Java edition uses for NBT
// strings: a big endian u16 byte length, then modified UTF-8.
const JAVA = [
  ['Creative', '00084372656174697665'],
  ['\u00c5\u00c4\u00d6', '0006c385c384c396'],
  ['\u26cf Prison \u26cf', '000ee29b8f20507269736f6e20e29b8f'],
  ['\ud83c\udf32 Skyblock \ud83c\udf32', '0016eda0bcedbcb220536b79626c6f636b20eda0bcedbcb2'],
  ['a\u0000b', '000461c08062'],
  ['\ud83d\ude00\ud83d\udc4d', '000ceda0bdedb880eda0bdedb18d']
]

// A Java edition compound with one string tag, as a server sends it in an item name.
function compoundWith (stringBytes) {
  return Buffer.concat([
    Buffer.from('0a0000', 'hex'), // compound, empty name
    Buffer.from('080004', 'hex'), Buffer.from('name'), // string tag "name"
    stringBytes,
    Buffer.from('00', 'hex') // end
  ])
}

function interpreter () {
  const proto = new ProtoDef()
  nbt.addTypesToInterpreter('big', proto)
  return proto
}

describe('java edition strings (modified UTF-8)', function () {
  for (const [text, hex] of JAVA) {
    it(`reads and writes ${JSON.stringify(text)} exactly as Java does`, function () {
      const bytes = Buffer.from(hex, 'hex')
      const buffer = compoundWith(bytes)
      const parsed = nbt.parseUncompressed(buffer, 'big')
      expect(parsed.value.name.value).to.equal(text)
      expect(nbt.writeUncompressed(parsed, 'big').equals(buffer)).to.equal(true)

      const interpreted = interpreter().parsePacketBuffer('nbt', buffer).data
      expect(interpreted.value.name.value).to.equal(text)
      expect(interpreter().createPacketBuffer('nbt', interpreted).equals(buffer)).to.equal(true)
    })
  }

  it('reads tag names the same way', function () {
    const name = Buffer.from('000ceda0bcedbcb2207461672020', 'hex') // emoji then " tag  "
    const buffer = Buffer.concat([Buffer.from('0a0000', 'hex'), Buffer.from('01', 'hex'), name, Buffer.from('0700', 'hex')])
    const parsed = nbt.parseUncompressed(buffer, 'big')
    expect(Object.keys(parsed.value)).to.deep.equal(['\ud83c\udf32 tag  '])
    expect(nbt.writeUncompressed(parsed, 'big').equals(buffer)).to.equal(true)
  })

  it('round trips every code unit through the builder', function () {
    let all = ''
    for (let c = 0; c < 0x10000; c++) all += String.fromCharCode(c)
    // Strings are at most 65535 bytes, so check it in slices.
    for (let i = 0; i < all.length; i += 20000) {
      const text = all.slice(i, i + 20000)
      const written = nbt.writeUncompressed(nbt.comp({ s: nbt.string(text) }), 'big')
      expect(nbt.parseUncompressed(written, 'big').value.s.value).to.equal(text)
    }
  })

  it('also reads standard 4 byte UTF-8, which some tools write', function () {
    const utf8 = Buffer.from('\ud83c\udf32 ok', 'utf8')
    const bytes = Buffer.concat([Buffer.from([0, utf8.length]), utf8])
    expect(nbt.parseUncompressed(compoundWith(bytes), 'big').value.name.value).to.equal('\ud83c\udf32 ok')
  })

  it('turns broken bytes into a replacement character and keeps reading', function () {
    const bytes = Buffer.from('0004ff41e29b', 'hex') // a stray byte, "A", a cut off 3 byte sequence
    expect(nbt.parseUncompressed(compoundWith(bytes), 'big').value.name.value).to.equal('\ufffdA\ufffd\ufffd')
  })

  it('fails on a string longer than the buffer', function () {
    const buffer = compoundWith(Buffer.from('0010414243', 'hex')).subarray(0, 12)
    expect(() => nbt.parseUncompressed(buffer, 'big')).to.throw()
  })

  it('refuses to write a string over 65535 bytes', function () {
    const value = nbt.comp({ s: nbt.string('\u26cf'.repeat(21846)) }) // 65538 bytes
    expect(() => nbt.writeUncompressed(value, 'big')).to.throw(/too long/)
  })

  it('counts bytes the way Java does', function () {
    expect(mutf8.byteLength('abc')).to.equal(3)
    expect(mutf8.byteLength('\u0000')).to.equal(2)
    expect(mutf8.byteLength('\u00c5')).to.equal(2)
    expect(mutf8.byteLength('\u26cf')).to.equal(3)
    expect(mutf8.byteLength('\ud83c\udf32')).to.equal(6)
  })
})

describe('bedrock edition strings stay plain UTF-8', function () {
  it('writes and reads an emoji as 4 byte UTF-8 in little endian NBT', function () {
    const value = nbt.comp({ s: nbt.string('\ud83c\udf32') })
    for (const proto of ['little', 'littleVarint']) {
      const written = nbt.writeUncompressed(value, proto)
      expect(written.includes(Buffer.from('f09f8cb2', 'hex'))).to.equal(true)
      expect(written.includes(Buffer.from('eda0bc', 'hex'))).to.equal(false)
      expect(nbt.parseUncompressed(written, proto).value.s.value).to.equal('\ud83c\udf32')
    }
  })
})
