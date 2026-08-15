const zigzag64 = require('protodef').types.zigzag64

// Normalizes any of the long representations this library produces or accepts
// ([high, low], protodef's SignedBigInt, BigInt, or number) to a signed 64-bit
// BigInt. The [high, low] case mirrors protodef's SignedBigInt#valueOf.
function toBigInt (value) {
  if (typeof value === 'bigint') return BigInt.asIntN(64, value)
  if (Array.isArray(value)) {
    return BigInt.asIntN(64, BigInt(value[0]) << 32n) | BigInt.asUintN(32, BigInt(value[1]))
  }
  return BigInt.asIntN(64, BigInt(value))
}

// littleVarint encodes long as a zigzag64, which protodef implements with a
// plain BigInt, while big/little use [high, low]. Accept every shape on write
// so a value parsed from (or built for) any format can be written as
// littleVarint without a manual conversion. See issue #190.
function writeLong (value, buffer, offset) {
  return zigzag64[1](toBigInt(value), buffer, offset)
}

function sizeOfLong (value) {
  return zigzag64[2](toBigInt(value))
}

module.exports = {
  toBigInt,
  compiler: {
    Read: {},
    Write: { zigzag64: ['native', writeLong] },
    SizeOf: { zigzag64: ['native', sizeOfLong] }
  },
  interpret: {
    zigzag64: [zigzag64[0], writeLong, sizeOfLong]
  }
}
