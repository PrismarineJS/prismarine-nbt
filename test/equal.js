/* eslint-env mocha */

'use strict'

const nbt = require('../nbt')
const expect = require('chai').expect

describe('test equal', function () {
  it('equal', async function () {
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
