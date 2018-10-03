export type Format = 'RFC1738' | 'RFC3986';

export type Formatter = (value: string | Buffer) => string;

type Formats = {
  [format in Format]: format
};

type Formatters = {
  [format in Format]: Formatter
};

export type FormatsExport = {
  default: Format,
  formatters: Formatters,
} & Formats;

export type ArrayFormat = 'brackets' | 'indices' | 'repeat';

export type arrayPrefixGenerator = (prefix: string, key?: string) => string;

export type arrayPrefixGenerators = {
  [format in ArrayFormat]: arrayPrefixGenerator
}

export type Filter<T> = (prefix: string, obj: T) => T;

export type Comparator = (a: Value, b: Value) => number;

export type Charset = 'iso-8859-1' | 'utf-8';

export type Decoder = (
  str: string,
  defaultDecoder: Decoder,
  charset: Charset
) => string;

export type Encoder = (
  str: string | Buffer,
  defaultEncoder: Encoder,
  charset?: Charset
) => string | Buffer;

export type UtilOptions = {
  allowDots: boolean,
  charset: Charset,
  plainObjects: boolean,
};

export type UtilOptionsInternal = UtilOptions & {
  allowPrototypes: boolean,
  arrayLimit: number,
};

type Nullish = null | undefined;
type NonNullishPrimitive = boolean | number | string | symbol;
type ObjectCoercible = object | NonNullishPrimitive;
type Primitive = Nullish | NonNullishPrimitive;
type Concatable<T> = T | T[];
type Value = Concatable<unknown>;
// TODO: type NonPrimitive = object; for use in JSDoc


export type arrayToObject = (source: Value[], options?: UtilOptionsInternal) => object;
export type assign = (target: object, source: object) => /* target */ object;
type queueObject = {
  [key: string]: Concatable<{}>,
};
type queueItem = {
  obj: queueObject,
  prop: keyof queueObject,
};
export type compactQueue = (queue: queueItem[]) => void;
export type compact = (value: ObjectCoercible) => ObjectCoercible;
export type isBuffer = (obj: (Buffer | Value) & ({ constructor?: typeof Buffer })) => boolean;
export type isRegExp = (obj: RegExp | Value) => boolean;
export type merge = (
  target: ObjectCoercible[] | object,
  source?: ObjectCoercible,
  options?: UtilOptionsInternal,
) => /* target | */ object;

export type utils = {
  arrayToObject: arrayToObject,
  assign: assign,
  compact: compact,
  decode: Decoder,
  encode: Encoder,
  isBuffer: isBuffer,
  isRegExp: isRegExp,
  merge: merge,
}

export type DateSerializer = (date: Date) => string | number;

export type StringifyOptionsInternal = UtilOptions & {
  arrayFormat: ArrayFormat,
  charsetSentinel: boolean,
  delimiter: string | RegExp,
  encode: boolean,
  encoder: Encoder,
  encodeValuesOnly: boolean,
  filter: Filter<object & ObjectCoercible> | Array<string | number>
  format: Format,
  serializeDate: DateSerializer,
  skipNulls: boolean,
  sort: Comparator,
  strictNullHandling: boolean,
};

export type StringifyOptions = Partial<StringifyOptionsInternal> & {
  encoder?: Encoder | null,
  addQueryPrefix?: boolean,
  indices?: boolean,
};

export type Stringify = (object: ObjectCoercible | Nullish, opts?: StringifyOptions) => string;

export type StringifyInternal = (
  object: Value,
  prefix: string,
  generateArrayPrefix: arrayPrefixGenerator,
  strictNullHandling: boolean,
  skipNulls: boolean,
  encoder: Encoder,
  filter: Filter<Value>,
  sort: Comparator,
  allowDots: boolean,
  serializeDate: DateSerializer,
  formatter: Formatter,
  encodeValuesOnly: boolean,
  charset: Charset,
) => Concatable<string | Buffer>;

export type InterpretNumericEntities = (str: string) => string;

export type ParseOptionsInternal = UtilOptions & {
  allowPrototypes: boolean,
  arrayLimit: number,
  charsetSentinel: boolean,
  decoder: Decoder,
  delimiter: string | RegExp,
  depth: number,
  ignoreQueryPrefix: boolean,
  interpretNumericEntities: InterpretNumericEntities | undefined,
  parameterLimit: number,
  parseArrays: boolean,
  strictNullHandling: boolean,
};

export type ParseOptions = Partial<ParseOptionsInternal> & {
  decoder?: Decoder,
};

export type Parse = (
  str: object | string | Nullish,
  opts?: ParseOptions,
) => object | Array<Value>;
