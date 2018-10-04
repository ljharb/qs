type Nullish = null | undefined;
type NonNullishPrimitive = boolean | number | string | symbol;
type ObjectCoercible = object | NonNullishPrimitive;
type Primitive = Nullish | NonNullishPrimitive;
type Concatable<T> = T | T[];
type Value = Concatable<object | Primitive>;

type NonPrimitive = object;
