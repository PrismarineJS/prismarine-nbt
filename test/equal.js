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
})
