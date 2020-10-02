
declare module 'prismarine-nbt'{
  type List<T extends TagTypes> = {type:'list', value: {type: Tag[T]['type'], value: Tag[T]['value'][]}};

  export type CompoundTag = {type: 'compound', value: {[x in string]?: Tag}};
  export type StringTag = {type: 'string', value: string};
  export type FloatTag = {type: 'float', value: number};
  export type IntTag = {type: 'int', value: number};
  export type ShortTag = {type: 'short', value: number};
  export type LongTag = {type: 'long', value: [number, number]};
  export type ByteArrayTag = {type: 'byteArray', value: number[]};
  export type IntArrayTag = {type: 'intArray', value: number[]};
  export type LongArrayTag = {type: 'longArray', value: [number, number][]};
  export type ListTag = List<TagTypes>
  type testType = List<'int'>
  export type Tag = CompoundTag | StringTag | FloatTag | IntTag | ShortTag | LongTag //| ByteArrayTag | IntArrayTag | LongArrayTag | ListTag;
  export type TagTypes = Tag['type']
  export type NBT = CompoundTag & {name: string};
  export function writeUncompressed(value: NBT, le: boolean = false): ArrayBuffer;
  export function parseUncompressed(value: ArrayBuffer, le: boolean = false): NBT;
  export function parse(data: ArrayBuffer, le:boolean, callback: (err: Error | null, value: NBT) => any): void;
  export function parse(data: ArrayBuffer, callback: (err: Error | null, value: NBT) => any): void;
  export function simplify(data: NBT): any
  export const proto: any;
  export const protoLE: any;
}