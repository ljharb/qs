
if (require.register) {
  var qs = require('querystring');
} else {
  var qs = require('../')
    , expect = require('expect.js');
}


describe('qs.stringify() - new ', function(){
  it('should parse a basic parameter', function(){
    expect(qs.parse('foo=bar')).to.eql({ 'foo': 'bar' }); 
  });

  it('should parse a pair of string parameters delimited by &', function() {
    expect(qs.parse('foo=bar&bar=baz')).to.eql({'foo' : 'bar', 'bar' : 'baz'});
  });

  it('should parse and excaped char', function(){
    expect(qs.parse('foo=%22bar%22')).to.eql({'foo' : '\"bar\"'});
  });

  it('should parse to empty string if a value is missing', function() {
    expect(qs.parse('foo=')).to.eql({foo:''});
  }); 
  it('should parse numeric values to strings', function() {
    expect(qs.parse('foo=1&bar=2')).to.eql({'foo' : '1', 'bar' : '2'});
  });
  it('should parse that weird field', function(){
    expect(qs.parse('my%20weird%20field=q1!2%22\'w%245%267%2Fz8)%3F')).to.eql({'my weird field': "q1!2\"'w$5&7/z8)?"});
  });

  it('should parse a = coded as html entity in the key', function() {
    expect(qs.parse('foo%3Dbaz=bar')).to.eql({'foo=baz': 'bar'}); 
  });

});
var date = new Date(0);

var str_identities = {
  'basics': [
    { str: 'foo=bar', obj: {'foo' : 'bar'}},
    { str: 'foo=%22bar%22', obj: {'foo' : '\"bar\"'}},
    { str: 'foo=', obj: {'foo': ''}},
    { str: 'foo=1&bar=2', obj: {'foo' : '1', 'bar' : '2'}},
    { str: 'my%20weird%20field=q1!2%22\'w%245%267%2Fz8)%3F', obj: {'my weird field': "q1!2\"'w$5&7/z8)?"}},
    { str: 'foo%3Dbaz=bar', obj: {'foo=baz': 'bar'}},
    { str: 'foo=bar&bar=baz', obj: {foo: 'bar', bar: 'baz'}},
    { str: 'foo=bar&baz=&raz=', obj: { foo: 'bar', baz: null, raz: undefined }},
    { str: 'foo=bar', obj: { foo: 'bar', '':'' }},
    { str: 'this=bar', obj: { 'this': 'bar', '':'' }},
    { str: 'null=bar', obj: { 'null': 'bar', '':'' }}
  ],
  'escaping': [
    { str: 'foo=foo%20bar', obj: {foo: 'foo bar'}},
    { str: 'cht=p3&chd=t%3A60%2C40&chs=250x100&chl=Hello%7CWorld', obj: {
        cht: 'p3'
      , chd: 't:60,40'
      , chs: '250x100'
      , chl: 'Hello|World'
    }}
  ],
  'nested': [
    { str: 'foo[0]=bar&foo[1]=quux', obj: {'foo' : ['bar', 'quux']}},
    { str: 'foo[0]=bar', obj: {foo: ['bar']}},
    { str: 'foo[0]=1&foo[1]=2', obj: {'foo' : ['1', '2']}},
    { str: 'foo=bar&baz[0]=1&baz[1]=2&baz[2]=3', obj: {'foo' : 'bar', 'baz' : ['1', '2', '3']}},
    { str: 'foo[0]=bar&baz[0]=1&baz[1]=2&baz[2]=3', obj: {'foo' : ['bar'], 'baz' : ['1', '2', '3']}},
    { str: 'x[y][z]=1', obj: {'x' : {'y' : {'z' : '1'}}}},
    { str: 'x[y][z][0]=1', obj: {'x' : {'y' : {'z' : ['1']}}}},
    { str: 'x[y][z]=2', obj: {'x' : {'y' : {'z' : '2'}}}},
    { str: 'x[y][z][0]=1&x[y][z][1]=2', obj: {'x' : {'y' : {'z' : ['1', '2']}}}},
    { str: 'x[y][0][z]=1', obj: {'x' : {'y' : [{'z' : '1'}]}}},
    { str: 'x[y][0][z][0]=1', obj: {'x' : {'y' : [{'z' : ['1']}]}}},
    { str: 'x[y][0][z]=1&x[y][0][w]=2', obj: {'x' : {'y' : [{'z' : '1', 'w' : '2'}]}}},
    { str: 'x[y][0][v][w]=1', obj: {'x' : {'y' : [{'v' : {'w' : '1'}}]}}},
    { str: 'x[y][0][z]=1&x[y][0][v][w]=2', obj: {'x' : {'y' : [{'z' : '1', 'v' : {'w' : '2'}}]}}},
    { str: 'x[y][0][z]=1&x[y][1][z]=2', obj: {'x' : {'y' : [{'z' : '1'}, {'z' : '2'}]}}},
    { str: 'x[y][0][z]=1&x[y][0][w]=a&x[y][1][z]=2&x[y][1][w]=3', obj: {'x' : {'y' : [{'z' : '1', 'w' : 'a'}, {'z' : '2', 'w' : '3'}]}}},
    { str: 'user[name][first]=tj&user[name][last]=holowaychuk', obj: { user: { name: { first: 'tj', last: 'holowaychuk' }}}}
  ],
  'errors': [
    { obj: {},     message: 'stringify expects an object' },
    { obj: null,     message: 'stringify expects an object' },
    { obj: 'foo=bar',     message: 'stringify expects an object' },
    { obj: ['foo', 'bar'], message: 'stringify expects an object' }
  ],
  'numbers': [
    { str: 'limit[0]=1&limit[1]=2&limit[2]=3', obj: { limit: [1, 2, '3'] }},
    { str: 'limit=1', obj: { limit: 1 }}
  ],
  'others': [
    { str: 'at=' + encodeURIComponent(date), obj: { at: date } }
  ]
};

function test(type) {
  return function(){
    var str, obj;
    for (var i = 0; i < str_identities[type].length; i++) {
      str = str_identities[type][i].str;
      obj = str_identities[type][i].obj;
      expect(qs.stringify(obj)).to.eql(str);
    }
  }
}

describe('qs.stringify()', function(){
  it('should support the basics', test('basics'))
  it('should support escapes', test('escaping'))
  it('should support nesting', test('nested'))
  it('should support numbers', test('numbers'))
  it('should support others', test('others'))
})
