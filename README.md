## Riddler

Riddler is a querystring parsing and stringifying library with some added security

## Usage

```javascript
var Riddler = require('riddler');

var obj = Riddler.parse('a=c');
console.log(obj); // { a: 'c' }

var str = Riddler.stringify(obj);
console.log(str); // 'a=c'
```

### Objects

Riddler allows you to create nested objects within your query strings, by surrounding the name of sub-keys with square brackets `[]`.

For example, in order to create an object:

```javascript
{
  foo: {
    bar: 'baz'
  }
}
```

One would use the string `foo[bar]=baz`.

You can also nest your objects:

```javascript
var obj = Riddler.parse('foo[bar][baz]=foobarbaz');
// obj = { foo: { bar: { baz: 'foobarbaz' } } }
```

By default, when nesting objects riddler will only parse up to 5 children deep. This means if you attempt to parse a string like `a[b][c][d][e][f][g][h][i]=j` your resulting object will be:

```javascript
{
  a: {
    b: {
      c: {
        d: {
          e: {
            f: {
              '[g][h][i]': 'j'
            }
          }
        }
      }
    }
  }
}
```

This depth can be overridden by passing a `depth` parameter to `riddler.parse()`:

```javascript
Riddler.parse('a[b][c][d][e][f][g][h][i]=j', 1);
// { a: { b: { '[c][d][e][f][g][h][i]': 'j' } } }
```

Having this limit helps mitigate abuse when riddler is used to parse user input, and it is recommended to keep it a reasonably small number.

### Arrays

Riddler can also parse arrays using a similar `[]` notation:

```javascript
Riddler.parse('a[]=b&a[]=c');
// { a: ['b', 'c'] }
```

You may specify an index as well:

```javascript
Riddler.parse('a[1]=c&a[0]=b');
// { a: ['b', 'c'] }
```

Note that the only difference between an index in an array and a key in an object is that the value between the brackets must be a number to create an array.

When creating arrays with specific indices, riddler will compact a sparse array to only the existing values preserving their order:

```javascript
Riddler.parse('a[1]=b&a[15]=c');
// { a: ['b', 'c'] }
```

If you mix notations, riddler will merge the two items into an object:

```javascript
Riddler.parse('a[0]=b&a[b]=c');
// { a: { '0': 'b', b: 'c' } }
```

You can also create arrays of objects:

```javascript
Riddler.parse('a[][b]=c');
// { a: [{ b: 'c' }] }
```
