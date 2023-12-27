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
    String = 'string',
    List = 'list',
    Compound = 'compound',
    ByteArray = 'byteArray',
    ShortArray = 'shortArray',
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
    [TagType.String]: { type: TagType.String, value: string };
    [TagType.List]: List<TagType>
    [TagType.Compound]: { type: TagType.Compound, value: Record<string, undefined | Tags[TagType]> };
    [TagType.ByteArray]: { type: TagType.ByteArray, value: number[] };
    [TagType.ShortArray]: { type: TagType.ShortArray, value: number[] };
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
  export function equal(nbt1: Tags[TagType], nbt2: Tags[TagType]): boolean
  // ProtoDef compiled protocols
  export const protos: { big: any, little: any, littleVarint: any };
  // Big Endian protocol
  export const proto: any;
  // Little Endian protocol
  export const protoLE: any;
  // Adds prismarine-nbt types to an ProtoDef compiler instance
  export function addTypesToCompiler(type: NBTFormat, compiler)
  // Adds prismarine-nbt types to a ProtoDef interpreter instance
  export function addTypesToInterpreter(type: NBTFormat, protodef)

  /** @deprecated */
  export function writeUncompressed(value: NBT, little?: boolean): Buffer;
  /** @deprecated */
  export function parseUncompressed(value: Buffer, little?: boolean): NBT;
  /** @deprecated */
  export function parse(data: Buffer, little: boolean, callback: (err: Error | null, value: NBT) => any): void;
  /** @deprecated */
  export function parse(data: Buffer, nbtType: NBTFormat, callback: (err: Error | null, value: NBT) => any): void;
  /** @deprecated */
  export function parse(data: Buffer, callback: (err: Error | null, value: NBT) => any): void;

  export function bool(val: number): { type: TagType.Short, value: number }
  export function short (val: number): { type: TagType.Short, value: number }
  export function byte<T extends number> (val: number): { type: TagType.Byte, value: number }
  export function string<T extends string | string[]> (val: T): { type: TagType.String, value: T }
  export function comp<T extends object | object[]> (val: T, name?: string): { type: TagType.Compound, name?: string, value: T }
  export function int<T extends number | number[]> (val: T): { type: TagType.Int, value: T }
  export function list<T extends string, K extends {type: T}>(value: K): { type: TagType.List; value: { type: T | 'end', value: K } }
  export function float<T extends number | number[]> (value: T): { type: TagType.Float, value: T}
  export function double<T extends number | number[]> (value: T): { type: TagType.Double, value: T}
  /**
   * @param value Takes a BigInt or an array of two 32-bit integers
   */
  export function long<T extends number | number[] |  BigInt> (value: T): { type: TagType.Long, value: T}
  // Arrays
  export function byteArray (value: number[]): { type: TagType.ByteArray, value: number[]}
  export function shortArray (value: number[]): { type: TagType.ShortArray, value: number[]}
  export function intArray (value: number[]): { type: TagType.ByteArray, value: number[]}
  export function longArray<T extends number[] | BigInt[]> (value: T): { type: TagType.LongArray, value: T}
}
