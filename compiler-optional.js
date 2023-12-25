function readOptionalNbt (buffer, offset, { tagType } = { tagType: 'nbt' }, rootNode) {
  if (offset + 1 > buffer.length) { throw new Error('Read out of bounds') }
  if (buffer.readInt8(offset) === 0) return { size: 1 }
  return this.read(buffer, offset, tagType, rootNode)
}

function writeOptionalNbt (value, buffer, offset, { tagType } = { tagType: 'nbt' }, rootNode) {
  if (value === undefined) {
    buffer.writeInt8(0, offset)
    return offset + 1
  }
  return this.write(value, buffer, offset, tagType, rootNode)
}

function sizeOfOptionalNbt (value, { tagType } = { tagType: 'nbt' }, rootNode) {
  if (value === undefined) { return 1 }
  return this.sizeOf(value, tagType, tagType, rootNode)
}

const compiler = {
  Read: {
    optionalNbt: ['parametrizable', (compiler, { tagType } = { tagType: 'nbt' }) => {
      const code = `
      if (offset + 1 > buffer.length) { throw new PartialReadError() }
      if (buffer.readInt8(offset) === 0) return { size: 1 }
      return ${compiler.callType(tagType)}
      `
      return compiler.wrapCode(code)
    }]
  },
  Write: {
    optionalNbt: ['parametrizable', (compiler, { tagType } = { tagType: 'nbt' }) => {
      const code = `
      if (value === undefined) {
        buffer.writeInt8(0, offset)
        return offset + 1
      }
      return ${compiler.callType(tagType)}
      `
      return compiler.wrapCode(code)
    }]
  },
  SizeOf: {
    optionalNbt: ['parametrizable', (compiler, { tagType } = { tagType: 'nbt' }) => {
      const code = `
      if (value === undefined) { return 1 }
      return ${compiler.callType(tagType)}
      `
      return compiler.wrapCode(code)
    }]
  }
}

module.exports = {
  compiler,
  interpert: { optionalNbt: [readOptionalNbt, writeOptionalNbt, sizeOfOptionalNbt] }
}
