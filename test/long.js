/* eslint-env mocha */

'use strict'

const nbt = require('../nbt')
const expect = require('chai').expect

// Regression tests for https://github.com/PrismarineJS/prismarine-nbt/issues/190
// long is [high, low] in big/little but BigInt in littleVarint; the writer must
// accept every shape in every format, and values must round-trip across formats.
describe('long across formats (#190)', function () {
  const formats = ['big', 'little', 'littleVarint']

  function comp (value) {
    return nbt.comp({ L: nbt.long(value) })
  }

  it('writes nbt.long([high, low]) as littleVarint', function () {
    const written = nbt.writeUncompressed(comp([0, 1]), 'littleVarint')
    const parsed = nbt.parseUncompressed(written, 'littleVarint')
    expect(parsed.value.L.value).to.equal(1n)
  })

  it('writes nbt.long(BigInt) in every format', function () {
    for (const format of formats) {
      const written = nbt.writeUncompressed(comp(5n), format)
      const parsed = nbt.parseUncompressed(written, format)
      expect(parsed.value.L.value.valueOf()).to.equal(5n)
    }
  })

  it('writes nbt.long([high, low]) in every format', function () {
    for (const format of formats) {
      const written = nbt.writeUncompressed(comp([0, 1]), format)
      const parsed = nbt.parseUncompressed(written, format)
      expect(parsed.value.L.value.valueOf()).to.equal(1n)
    }
  })

  it('round-trips a long parsed from big/little through littleVarint', function () {
    for (const source of ['big', 'little']) {
      const fromSource = nbt.parseUncompressed(nbt.writeUncompressed(comp([0, 1]), source), source)
      const written = nbt.writeUncompressed(fromSource, 'littleVarint')
      const parsed = nbt.parseUncompressed(written, 'littleVarint')
      expect(parsed.value.L.value).to.equal(1n)
    }
  })

  it('round-trips a long parsed from littleVarint through big/little', function () {
    const fromVarint = nbt.parseUncompressed(nbt.writeUncompressed(comp(1n), 'littleVarint'), 'littleVarint')
    for (const target of ['big', 'little']) {
      const written = nbt.writeUncompressed(fromVarint, target)
      const parsed = nbt.parseUncompressed(written, target)
      expect(parsed.value.L.value.valueOf()).to.equal(1n)
    }
  })

  it('preserves negative longs across formats', function () {
    for (const format of formats) {
      const written = nbt.writeUncompressed(comp([-1, -75715]), format)
      const parsed = nbt.parseUncompressed(written, format)
      expect(parsed.value.L.value.valueOf()).to.equal(-75715n)
    }
  })

  it('keeps longArray as [high, low] in littleVarint', function () {
    const written = nbt.writeUncompressed(nbt.comp({ A: nbt.longArray([[0, 7], [1, 2]]) }), 'littleVarint')
    const parsed = nbt.parseUncompressed(written, 'littleVarint')
    expect(parsed.value.A.value).to.deep.equal([[0, 7], [1, 2]])
  })
})
