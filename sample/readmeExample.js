const fs = require('fs')
const { parse, writeUncompressed } = require('../nbt')

async function main (file) {
  if (!file) {
    console.error('./readmeExample [path to nbt file]')
    process.exit(1)
  }
  const buffer = await fs.promises.readFile(file)
  const { result, type } = await parse(buffer)
  const json = JSON.stringify(result, (k, v) => typeof v === 'bigint' ? v.toString() : v)
  console.log('JSON serialized:', json)

  // Write it back
  const outBuffer = fs.createWriteStream('file.nbt')
  const newBuf = writeUncompressed(result, type)
  outBuffer.write(newBuf)
  outBuffer.end(() => console.log('written!'))
}

main(process.argv[2])
