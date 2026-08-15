/* eslint-env mocha */

'use strict'

const nbt = require('../nbt')
const expect = require('chai').expect

describe('test equal', function () {
  it('equals datatypes', async function () {
    const nbt1 = {
      type: 'compound',
      name: '',
      value: {
        byte: { type: 'byte', value: 123 },
        short: { type: 'short', value: 12345 },
        int: { type: 'int', value: 1234567 },
        long: { type: 'long', value: [1234, 5678] },
        float: { type: 'float', value: 123.456 },
        double: { type: 'double', value: 123.456789 },
        string: { type: 'string', value: 'I am a string' },
        list: { type: 'list', value: { type: 'int', value: [100, 200, 300] } },
        compound: {
          name: 'test',
          type: 'compound',
          value: { test: { type: 'string', value: 'I am also a string' } }
        },
        byteArray: { type: 'byteArray', value: [1, 2, 3] },
        shortArray: { type: 'shortArray', value: [10, 20, 30] },
        intArray: { type: 'intArray', value: [100, 200, 300] },
        longArray: { type: 'longArray', value: [[12, 34], [56, 78]] }
      }
    }

    const nbt2 = {
      type: 'compound',
      name: '',
      value: {
        byte: nbt.byte(123),
        short: nbt.short(12345),
        int: nbt.int(1234567),
        long: nbt.long([1234, 5678]),
        float: nbt.float(123.456),
        double: nbt.double(123.456789),
        string: nbt.string('I am a string'),
        list: nbt.list(nbt.int([100, 200, 300])),
        compound: nbt.comp({ test: nbt.string('I am also a string') }, 'test'),
        byteArray: nbt.byteArray([1, 2, 3]),
        shortArray: nbt.shortArray([10, 20, 30]),
        intArray: nbt.intArray([100, 200, 300]),
        longArray: nbt.longArray([[12, 34], [56, 78]])
      }
    }

    expect(nbt.equal(nbt1, nbt2)).to.equal(true)
  })

  it('equals item objects', async function () {
    const nbt1 = {
      type: 'compound',
      name: '',
      value: {
        Damage: {
          type: 'short',
          value: 0
        },
        Display: {
          type: 'compound',
          value: {
            CustomName: {
              type: 'string',
              value: 'a custom name'
            }
          }
        }
      }
    }
    const nbt2 = {
      type: 'compound',
      name: '',
      value: {
        Damage: {
          type: 'short',
          value: 0
        },
        Display: {
          type: 'compound',
          value: {
            CustomName: {
              type: 'string',
              value: 'a custom name'
            }
          }
        }
      }
    }
    const nbt3 = {
      type: 'compound',
      name: '',
      value: {
        Damage: {
          type: 'short',
          value: 0
        },
        Display: {
          type: 'compound',
          value: {
            CustomName: {
              type: 'string',
              value: 'a different custom name'
            }
          }
        }
      }
    }
    const nbt4 = {
      type: 'compound',
      name: '',
      value: {
        Damage: {
          type: 'short',
          value: 25
        },
        Display: {
          type: 'compound',
          value: {
            CustomName: {
              type: 'string',
              value: 'a custom name'
            }
          }
        }
      }
    }

    expect(nbt.equal(nbt1, nbt1)).to.equal(true)
    expect(nbt.equal(nbt1, nbt2)).to.equal(true)
    expect(nbt.equal(nbt1, nbt3)).to.equal(false)
    expect(nbt.equal(nbt1, nbt4)).to.equal(false)
    expect(nbt.equal(nbt3, nbt4)).to.equal(false)
  })

  it('compares longs by value across representations (#190)', async function () {
    // littleVarint parses longs as BigInt, big/little as [high, low]
    const longBigInt = { type: 'long', value: 1n }
    const longBigInt2 = { type: 'long', value: 2n }
    const longArrayHL = { type: 'long', value: [0, 1] }
    const longNegBigInt = { type: 'long', value: -75715n }
    const longNegHL = { type: 'long', value: [-1, -75715] }

    // BigInt longs must not all compare equal (the silent-failure case)
    expect(nbt.equal(longBigInt, longBigInt2)).to.equal(false)
    expect(nbt.equal(longBigInt, { type: 'long', value: 1n })).to.equal(true)
    // BigInt and [high, low] holding the same value are equal
    expect(nbt.equal(longBigInt, longArrayHL)).to.equal(true)
    expect(nbt.equal(longArrayHL, longBigInt)).to.equal(true)
    expect(nbt.equal(longNegBigInt, longNegHL)).to.equal(true)
    expect(nbt.equal(longBigInt, longNegBigInt)).to.equal(false)

    // longArray elements compare by value too
    const arrA = { type: 'longArray', value: [[0, 1], [0, 2]] }
    const arrB = { type: 'longArray', value: [1n, 2n] }
    const arrC = { type: 'longArray', value: [[0, 1], [0, 3]] }
    expect(nbt.equal(arrA, arrB)).to.equal(true)
    expect(nbt.equal(arrA, arrC)).to.equal(false)
  })
})
