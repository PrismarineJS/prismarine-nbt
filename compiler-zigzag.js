/* global PartialReadError */

class BigIntExtended extends Array {
  constructor (arg, isLE) {
    const arr = [Number((arg >> 32n) & 0xFFFFFFFFn), Number(arg & 0xFFFFFFFFn)]
    if (isLE) arr.reverse()
    super(...arr)
    this.arg = arg // <- is this needed?
    this.isLE = isLE | 0
    this.valueOf = () => arg
  }
}

function sizeOfVarInt (value) {
  if (typeof value !== 'bigint') value = BigInt(value)
  let cursor = 0
  value = (value << 1n) ^ (value >> 31n)
  while (value & ~0x7Fn) {
    value >>= 7n
    cursor++
  }
  return cursor + 1
}

function readSignedVarLong (buffer, offset) {
  let result = BigInt(0)
  let shift = 0
  let cursor = offset
  let size = 0

  while (true) {
    if (cursor + 1 > buffer.length) { throw new PartialReadError() }
    const b = buffer.readUInt8(cursor)
    result |= BigInt((b & 0x7f) << shift) // Add the bits to our number, except MSB
    cursor++
    if (!(b & 0x80)) { // If the MSB is not set, we return the number
      size = cursor - offset
      break
    }
    shift += 7 // we only have 7 bits, MSB being the return-trigger
    if (shift > 63) throw new PartialReadError(`varint is too big: ${shift}`)
  }

  const unsigned = result
  const zigzag = (unsigned >> 1n) ^ (unsigned & (1n << 63n))
  const value = new BigIntExtended(zigzag, true)
  return { value, size }
}

function writeSignedVarLong (value, buffer, offset) {
  value = value.valueOf()
  // if an array, turn it into a BigInt
  if (typeof value === 'object') {
    value[0] &= 0xFFFFFFFF
    value[1] &= 0xFFFFFFFF
    value = BigInt.asIntN(64, (BigInt(value[0]) << 32n)) | BigInt(value[1])
  } else if (typeof value !== 'bigint') value = BigInt(value)

  value = (value << 1n) ^ (value >> 31n)
  let cursor = 0
  while (value & ~0x7Fn) {
    const num = Number((value & 0xFFn) | 0x80n)
    buffer.writeUInt8(num, offset + cursor)
    cursor++
    value >>= 7n
  }
  buffer.writeUInt8(Number(value), offset + cursor)
  return offset + cursor + 1
}

function readSignedVarInt (buffer, offset) {
  let result = 0
  let shift = 0
  let cursor = offset
  let size = 0

  while (true) {
    if (cursor + 1 > buffer.length) { throw new PartialReadError() }
    const b = buffer.readUInt8(cursor)
    result |= ((b & 0x7f) << shift) // Add the bits to our number, except MSB
    cursor++
    if (!(b & 0x80)) { // If the MSB is not set, we return the number
      size = cursor - offset
      break
    }
    shift += 7 // we only have 7 bits, MSB being the return-trigger
    if (shift > 63) throw new PartialReadError(`varint is too big: ${shift}`)
  }

  const zigzag = (((result << 63) >> 63) ^ result) >> 1
  const value = zigzag ^ (result & (1 << 63))
  return { value, size }
}

function writeSignedVarInt (value, buffer, offset) {
  value = (value << 1) ^ (value >> 31)
  let cursor = 0
  while (value & ~0x7F) {
    const num = Number((value & 0xFF) | 0x80)
    buffer.writeUInt8(num, offset + cursor)
    cursor++
    value >>= 7
  }
  buffer.writeUInt8(value, offset + cursor)
  return offset + cursor + 1
}

module.exports = {
  Read: { zigzag64: ['context', readSignedVarLong], zigzag32: ['context', readSignedVarInt] },
  Write: { zigzag64: ['context', writeSignedVarLong], zigzag32: ['context', writeSignedVarInt] },
  SizeOf: { zigzag64: ['context', sizeOfVarInt], zigzag32: ['context', sizeOfVarInt] }
}
