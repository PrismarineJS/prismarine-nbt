/* global PartialReadError */
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

function readSignedVarInt (buffer, offset) {
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
  const zigzag = unsigned >> 1n
  const value = zigzag ^ (unsigned & (1n << 63n))
  return { value, size }
}

function writeSignedVarInt (value, buffer, offset) {
  if (typeof value !== 'bigint') value = BigInt(value)
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

module.exports = {
  Read: { zigzag: ['context', readSignedVarInt] },
  Write: { zigzag: ['context', writeSignedVarInt] },
  SizeOf: { zigzag: ['context', sizeOfVarInt] }
}
