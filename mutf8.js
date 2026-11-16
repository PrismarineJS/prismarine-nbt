'use strict'

// Java edition NBT strings use Java's "modified UTF-8" (DataOutput.writeUTF):
// - the null character is written as two bytes, 0xC0 0x80
// - characters outside the Basic Multilingual Plane (most emoji) are written as
//   two 3 byte sequences, one per UTF-16 surrogate, instead of one 4 byte sequence
// Plain UTF-8 decoding turns those surrogate halves into replacement characters,
// so they are decoded here unit by unit. Bedrock NBT uses plain UTF-8 and does not
// use this file.

const { PartialReadError } = require('protodef').utils

function decode (buffer, start, end) {
  // Most strings are plain ASCII, which reads the same either way.
  let i = start
  while (i < end && buffer[i] < 0x80) i++
  if (i === end) return buffer.latin1Slice ? buffer.latin1Slice(start, end) : buffer.toString('latin1', start, end)

  const units = []
  for (let j = start; j < i; j++) units.push(buffer[j])
  while (i < end) {
    const a = buffer[i]
    if (a < 0x80) {
      units.push(a)
      i += 1
    } else if ((a & 0xe0) === 0xc0 && i + 1 < end && (buffer[i + 1] & 0xc0) === 0x80) {
      units.push(((a & 0x1f) << 6) | (buffer[i + 1] & 0x3f))
      i += 2
    } else if ((a & 0xf0) === 0xe0 && i + 2 < end && (buffer[i + 1] & 0xc0) === 0x80 && (buffer[i + 2] & 0xc0) === 0x80) {
      // A surrogate half comes out as its own code unit; two of them make one character.
      units.push(((a & 0x0f) << 12) | ((buffer[i + 1] & 0x3f) << 6) | (buffer[i + 2] & 0x3f))
      i += 3
    } else if ((a & 0xf8) === 0xf0 && i + 3 < end && (buffer[i + 1] & 0xc0) === 0x80 && (buffer[i + 2] & 0xc0) === 0x80 && (buffer[i + 3] & 0xc0) === 0x80) {
      // Standard 4 byte UTF-8 is not what Java writes, but some tools do; read it as well.
      const cp = ((a & 0x07) << 18) | ((buffer[i + 1] & 0x3f) << 12) | ((buffer[i + 2] & 0x3f) << 6) | (buffer[i + 3] & 0x3f)
      const v = cp - 0x10000
      units.push(0xd800 | (v >> 10), 0xdc00 | (v & 0x3ff))
      i += 4
    } else {
      units.push(0xfffd)
      i += 1
    }
  }
  let out = ''
  for (let k = 0; k < units.length; k += 4096) out += String.fromCharCode.apply(null, units.slice(k, k + 4096))
  return out
}

function byteLength (value) {
  let size = 0
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i)
    if (c !== 0 && c < 0x80) size += 1
    else if (c < 0x800) size += 2
    else size += 3
  }
  return size
}

function encode (value, buffer, offset) {
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i)
    if (c !== 0 && c < 0x80) {
      buffer[offset++] = c
    } else if (c < 0x800) {
      buffer[offset++] = 0xc0 | (c >> 6)
      buffer[offset++] = 0x80 | (c & 0x3f)
    } else {
      buffer[offset++] = 0xe0 | (c >> 12)
      buffer[offset++] = 0x80 | ((c >> 6) & 0x3f)
      buffer[offset++] = 0x80 | (c & 0x3f)
    }
  }
  return offset
}

function readShortString (buffer, offset) {
  if (offset + 2 > buffer.length) throw new PartialReadError()
  const length = buffer.readUInt16BE(offset)
  const start = offset + 2
  if (start + length > buffer.length) throw new PartialReadError()
  return { value: decode(buffer, start, start + length), size: 2 + length }
}

function writeShortString (value, buffer, offset) {
  const length = byteLength(value)
  if (length > 0xffff) throw new Error(`NBT string too long: ${length} bytes, at most 65535`)
  buffer.writeUInt16BE(length, offset)
  return encode(value, buffer, offset + 2)
}

function sizeOfShortString (value) {
  return 2 + byteLength(value)
}

module.exports = {
  decode,
  encode,
  byteLength,
  compiler: {
    Read: { shortString: ['native', readShortString] },
    Write: { shortString: ['native', writeShortString] },
    SizeOf: { shortString: ['native', sizeOfShortString] }
  },
  interpret: {
    shortString: [readShortString, writeShortString, sizeOfShortString]
  }
}
