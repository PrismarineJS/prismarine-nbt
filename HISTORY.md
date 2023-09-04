# History

## 2.3.0
* [Allow zigzag encoded varints to be read up to 64bits (#74)](https://github.com/PrismarineJS/prismarine-nbt/commit/7022802e138db82753c69fdfd3423289366621a1) (thanks @extremeheat)
* [Add command gh workflow allowing to use release command in comments (#73)](https://github.com/PrismarineJS/prismarine-nbt/commit/16c78c083797e410ebf5216145c2a406e286be27) (thanks @rom1504)
* [equal() function to test NBT equality (#72)](https://github.com/PrismarineJS/prismarine-nbt/commit/44fb7ee41f7f564121b5587b0551df7a2adb8831) (thanks @CreeperG16)
* [Update to node 18.0.0 (#71)](https://github.com/PrismarineJS/prismarine-nbt/commit/05ffcd5d7e8ff532a61e3a60d71d4441013b3e69) (thanks @rom1504)
* [Add ShortArray typings and fix builder function typings (#70)](https://github.com/PrismarineJS/prismarine-nbt/commit/eae4d9c7dc59f05d8aa408a1370674e7361d60d5) (thanks @qhyun2)
* [Bump mocha from 9.2.2 to 10.0.0 (#67)](https://github.com/PrismarineJS/prismarine-nbt/commit/34bdff2b8ec81e4f4ed7f7326c4c6d2349c7c48a) (thanks @dependabot[bot])
* [Bump standard from 16.0.4 to 17.0.0 (#65)](https://github.com/PrismarineJS/prismarine-nbt/commit/554aae29e031dcce32f11ec8d7d9a56df0fd8bbb) (thanks @dependabot[bot])

## 2.2.1

* Use u16 countType for shortString

## 2.2.0

* Add some builder functions

## 2.1.0

* Add .float() method to builder

## 2.0.0

* breaking change to the nbt builder (@extremeheat)

## 1.6.0

* add nbt builder (@U9G)

## 1.5.0

* Little endian updates, automatic format detection (@extremeheat)

## 1.4.0

* typings (@mcbobby123 and @Dep0sit)

## 1.3.0

* use protodef compiler, making prismarine-nbt much much faster (10x), thanks @Karang

## 1.2.1

* fix long array : the countType is i32 not i64

## 1.2.0

* add long array

## 1.1.1

* remove fs.read for webpack

## 1.1.0

* fix nbt.simplify

## 1.0.0

* add little endian nbt support (for mcpe)

## 0.2.2

* get back to full es5

## 0.2.1

* update protodef

## 0.2.0

* add simplify

## 0.1.0

* completely reimplement using ProtoDef, the API is mostly compatible with the old version

## 0.0.1

* import from nbt.js + changes to make writing possible
