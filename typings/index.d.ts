/// <reference types="node" resolution-mode="require"/>
declare module 'prismarine-nbt' {
  // @ts-expect-error - protodef is untyped
  import type { Compiler, Interpreter } from "protodef";

  export type Byte = { type: `${TagType.Byte}`, value: number };
  export type Short = { type: `${TagType.Short}`, value: number };
  export type Int = { type: `${TagType.Int}`, value: number };
  export type Long = { type: `${TagType.Long}`, value: [number, number] };
  export type Float = { type: `${TagType.Float}`, value: number };
  export type Double = { type: `${TagType.Double}`, value: number };
  export type String = { type: `${TagType.String}`, value: string };
  export type List<T extends TagType> = {
    type: `${TagType.List}`,
    value: { type: Tags[T]['type'], value: Tags[T]['value'][] }
  };
  export type Compound = { type: `${TagType.Compound}`, value: Record<string, undefined | Tags[TagType]> };
  export type ByteArray = { type: `${TagType.ByteArray}`, value: Byte["value"][] };
  export type ShortArray = { type: `${TagType.ShortArray}`, value: Short["value"][] };
  export type IntArray = { type: `${TagType.IntArray}`, value: Int["value"][] };
  export type LongArray = { type: `${TagType.LongArray}`, value: Long["value"][] };

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
    [TagType.Byte]: Byte;
    [TagType.Short]: Short;
    [TagType.Int]: Int;
    [TagType.Long]: Long;
    [TagType.Float]: Float;
    [TagType.Double]: Double;
    [TagType.String]: String;
    [TagType.List]: List<TagType>;
    [TagType.Compound]: Compound;
    [TagType.ByteArray]: ByteArray;
    [TagType.ShortArray]: ShortArray;
    [TagType.IntArray]: IntArray;
    [TagType.LongArray]: LongArray;
  }

  interface ParseOptions {
    noArraySizeCheck?: boolean;
  }

  export type NBTFormat = 'big' | 'little' | 'littleVarint'

  export type NBT = Tags['compound'] & { name: string };
  export type Metadata = {
    // The decompressed buffer
    buffer: Buffer
    // The length of bytes read from the buffer
    size: number
  }
  export function writeUncompressed(value: NBT, format?: NBTFormat): Buffer;
  export function parseUncompressed(value: Buffer, format?: NBTFormat, options?: ParseOptions): NBT;
  export function parseAs(value: Buffer, type: NBTFormat, options?: ParseOptions): Promise<{ parsed: NBT, type: NBTFormat, metadata: Metadata }>;

  export function parse(data: Buffer | ArrayBuffer, nbtType?: NBTFormat): Promise<{ parsed: NBT, type: NBTFormat, metadata: Metadata }>;
  export function simplify(data: Tags[TagType]): any
  export function equal(nbt1: Tags[TagType], nbt2: Tags[TagType]): boolean
  // ProtoDef compiled protocols
  export const protos: { big: any, little: any, littleVarint: any };
  // Big Endian protocol
  export const proto: any;
  // Little Endian protocol
  export const protoLE: any;
  // Adds prismarine-nbt types to an ProtoDef compiler instance
  export function addTypesToCompiler(type: NBTFormat, compiler: Compiler): void;
  // Adds prismarine-nbt types to a ProtoDef interpreter instance
  export function addTypesToInterpreter(type: NBTFormat, protodef: Interpreter): void;

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

  // Builder methods
  export function bool<T extends number | number[]>(val: T): { type: `${TagType.Short}`, value: T }
  export function short<T extends number | number[]>(val: T): { type: `${TagType.Short}`, value: T }
  export function byte<T extends number | number[]>(val: T): { type: `${TagType.Byte}`, value: T }
  export function string<T extends string | string[]>(val: T): { type: `${TagType.String}`, value: T }
  export function comp<T extends object | object[]>(val: T, name?: string): { type: `${TagType.Compound}`, name?: string, value: T }
  export function int<T extends number | number[]>(val: T): { type: `${TagType.Int}`, value: T }
  export function list<T extends string, K extends { type: T }>(value: K): { type: `${TagType.List}`; value: { type: T | 'end', value: K } }
  export function float<T extends number | number[]>(value: T): { type: `${TagType.Float}`, value: T }
  export function double<T extends number | number[]>(value: T): { type: `${TagType.Double}`, value: T }
  /**
   * @param value Takes a BigInt or an array of two 32-bit integers
   */
  export function long<T extends number | number[] | BigInt>(value: T): { type: `${TagType.Long}`, value: T }
  // Arrays
  export function byteArray(value: number[]): { type: `${TagType.ByteArray}`, value: number[] }
  export function shortArray(value: number[]): { type: `${TagType.ShortArray}`, value: number[] }
  export function intArray(value: number[]): { type: `${TagType.ByteArray}`, value: number[] }
  export function longArray<T extends number[] | BigInt[]>(value: T): { type: `${TagType.LongArray}`, value: T }
}
