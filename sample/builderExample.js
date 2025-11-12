const fs = require('fs')
const nbt = require('prismarine-nbt')

const tag = nbt.comp({
  Air: nbt.short(300),
  Armor: nbt.list(nbt.comp([
    { Count: nbt.byte(0), Damage: nbt.short(0), Name: nbt.string('a') },
    { Count: nbt.byte(0), Damage: nbt.short(0), Name: nbt.string('b') },
    { Count: nbt.byte(0), Damage: nbt.short(0), Name: nbt.string('c') }
  ]))
})

const buffer = nbt.writeUncompressed(tag)
fs.createWriteStream('tag.nbt').write(buffer)
