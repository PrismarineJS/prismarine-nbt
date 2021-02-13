declare module 'prismarine-nbt'{
  export type List<T extends TagType> = {
    type: TagType.List,
    value: { type: Tags[T]['type'], value: Tags[T]['value'][] }
  };

  export enum TagType {
    Byte = 'byte',
    Short = 'short',
    Int = 'int',
    Long = 'long',
    Float = 'float',
    Double = 'double',
    ByteArray = 'byteArray',
    String = 'string',
    List = 'list',
    Compound = 'compound',
    IntArray = 'intArray',
    LongArray = 'longArray',
  }

  export type Tags = {
    [TagType.Byte]: { type: TagType.Byte, value: number };
    [TagType.Short]: { type: TagType.Short, value: number };
    [TagType.Int]: { type: TagType.Int, value: number };
    [TagType.Long]: { type: TagType.Long, value: [number, number] };
    [TagType.Float]: { type: TagType.Float, value: number };
    [TagType.Double]: { type: TagType.Double, value: number };
    [TagType.ByteArray]: { type: TagType.ByteArray, value: number[] };
    [TagType.String]: { type: TagType.String, value: string };
    [TagType.List]: List<TagType>
    [TagType.Compound]: { type: TagType.Compound, value: Record<string, undefined | Tags[TagType]> };
    [TagType.IntArray]: { type: TagType.IntArray, value: number[] };
    [TagType.LongArray]: { type: TagType.LongArray, value: [number, number][] };
  }

  export type NBTFormat = 'big' | 'little' | 'littleVarint'

  export type NBT = Tags['compound'] & {name: string};
  export type Metadata = {
    // The decompressed buffer
    buffer: Buffer
    // The length of bytes read from the buffer
    size: number
  }
  export function writeUncompressed(value: NBT, format?: NBTFormat): Buffer;
  export function parseUncompressed(value: Buffer, format?: NBTFormat): NBT;
  
  export function parse(data: Buffer, nbtType?: NBTFormat): Promise<{parsed: NBT, type: NBTFormat, metadata: Metadata}>;
  export function simplify(data: Tags[TagType]): any
  // ProtoDef compiled protocols
  export const protos: { big, little, littleVarint };
  // Big Endian protocol
  export const proto: any;
  // Little Endian protocol
  export const protoLE: any;

  /** @deprecated */
  export function writeUncompressed(value: NBT, little?: boolean): Buffer;
  /** @deprecated */
  export function parseUncompressed(value: Buffer, little?: boolean): NBT;
  /** @deprecated */
  export function parse(data: Buffer, little: boolean, callback: (err: Error | null, value: NBT) => any);
  /** @deprecated */
  export function parse(data: Buffer, nbtType: NBTFormat, callback: (err: Error | null, value: NBT) => any);
  /** @deprecated */
  export function parse(data: Buffer, callback: (err: Error | null, value: NBT) => any);
}