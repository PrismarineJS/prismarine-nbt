function readOptionalNbt (buffer, offset, { tagType }, rootNode) {
  if (offset + 1 > buffer.length) { throw new Error('Read out of bounds') }
  if (buffer.readInt8(offset) === 0) return { size: 1 }
  return this.read(buffer, offset, tagType, rootNode)
}

function writeOptionalNbt (value, buffer, offset, { tagType }, rootNode) {
  if (value === undefined) {
    buffer.writeInt8(0, offset)
    return offset + 1
  }
  return this.write(value, buffer, offset, tagType, rootNode)
}

function sizeOfOptionalNbt (value, { tagType }, rootNode) {
  if (value === undefined) { return 1 }
  return this.sizeOf(value, tagType, tagType, rootNode)
}

const compiler = {
  Read: {
    optionalNbtType: ['parametrizable', (compiler, { tagType }) => {
      return compiler.wrapCode(`
if (offset + 1 > buffer.length) { throw new PartialReadError() }
if (buffer.readInt8(offset) === 0) return { size: 1 }
return ${compiler.callType(tagType)}
      `)
    }]
  },
  Write: {
    optionalNbtType: ['parametrizable', (compiler, { tagType }) => {
      return compiler.wrapCode(`
if (value === undefined) {
  buffer.writeInt8(0, offset)
  return offset + 1
}
return ${compiler.callType('value', tagType)}
      `)
    }]
  },
  SizeOf: {
    optionalNbtType: ['parametrizable', (compiler, { tagType }) => {
      return compiler.wrapCode(`
if (value === undefined) { return 1 }
return ${compiler.callType('value', tagType)}
      `)
    }]
  }
}

module.exports = {
  compiler,
  interpret: { optionalNbtType: [readOptionalNbt, writeOptionalNbt, sizeOfOptionalNbt] }
}
