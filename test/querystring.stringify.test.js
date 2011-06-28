
/**
 * Module dependencies.
 */

var qs = require('../')
  , should = require('should')
  , query_string_identities = {
    'basics': [
      {query_string: 'foo=bar', parsed: {'foo' : 'bar'}},
      {query_string: 'foo=%22bar%22', parsed: {'foo' : '\"bar\"'}},
      {query_string: 'foo=', parsed: {'foo': ''}},
      {query_string: 'foo=1&bar=2', parsed: {'foo' : '1', 'bar' : '2'}},
      {query_string: 'my%20weird%20field=q1!2%22\'w%245%267%2Fz8)%3F', parsed: {'my weird field': "q1!2\"'w$5&7/z8)?"}},
      {query_string: 'foo%3Dbaz=bar', parsed: {'foo=baz': 'bar'}},
      {query_string: 'foo=bar&bar=baz', parsed: {foo: 'bar', bar: 'baz'}}
    ],
    'escaping': [
      {query_string: 'foo=foo%20bar', parsed: {foo: 'foo bar'}},
      {query_string: 'cht=p3&chd=t%3A60%2C40&chs=250x100&chl=Hello%7CWorld', parsed: {
          cht: 'p3'
        , chd: 't:60,40'
        , chs: '250x100'
        , chl: 'Hello|World'
      }}
    ],
    'nested': [
      {query_string: 'foo[]=bar&foo[]=quux', parsed: {'foo' : ['bar', 'quux']}},
      {query_string: 'foo[]=bar', parsed: {foo: ['bar']}},
      {query_string: 'foo[]=1&foo[]=2', parsed: {'foo' : ['1', '2']}},
      {query_string: 'foo=bar&baz[]=1&baz[]=2&baz[]=3', parsed: {'foo' : 'bar', 'baz' : ['1', '2', '3']}},
      {query_string: 'foo[]=bar&baz[]=1&baz[]=2&baz[]=3', parsed: {'foo' : ['bar'], 'baz' : ['1', '2', '3']}},
      {query_string: 'x[y][z]=1', parsed: {'x' : {'y' : {'z' : '1'}}}},
      {query_string: 'x[y][z][]=1', parsed: {'x' : {'y' : {'z' : ['1']}}}},
      {query_string: 'x[y][z]=2', parsed: {'x' : {'y' : {'z' : '2'}}}},
      {query_string: 'x[y][z][]=1&x[y][z][]=2', parsed: {'x' : {'y' : {'z' : ['1', '2']}}}},
      {query_string: 'x[y][][z]=1', parsed: {'x' : {'y' : [{'z' : '1'}]}}},
      {query_string: 'x[y][][z][]=1', parsed: {'x' : {'y' : [{'z' : ['1']}]}}},
      {query_string: 'x[y][][z]=1&x[y][][w]=2', parsed: {'x' : {'y' : [{'z' : '1', 'w' : '2'}]}}},
      {query_string: 'x[y][][v][w]=1', parsed: {'x' : {'y' : [{'v' : {'w' : '1'}}]}}},
      {query_string: 'x[y][][z]=1&x[y][][v][w]=2', parsed: {'x' : {'y' : [{'z' : '1', 'v' : {'w' : '2'}}]}}},
      {query_string: 'x[y][][z]=1&x[y][][z]=2', parsed: {'x' : {'y' : [{'z' : '1'}, {'z' : '2'}]}}},
      {query_string: 'x[y][][z]=1&x[y][][w]=a&x[y][][z]=2&x[y][][w]=3', parsed: {'x' : {'y' : [{'z' : '1', 'w' : 'a'}, {'z' : '2', 'w' : '3'}]}}},
      {query_string: 'user[name][first]=tj&user[name][last]=holowaychuk', parsed: { user: { name: { first: 'tj', last: 'holowaychuk' }}}}
    ]
  };
  
module.exports = {
  'test basics': function() {
    var query_string, parsed;
    for (var i = 0; i < query_string_identities['basics'].length; i++) {
      query_string = query_string_identities['basics'][i].query_string;
      parsed       = query_string_identities['basics'][i].parsed;
      qs.stringify(parsed).should.eql(query_string);
    }
  },
  'test escaping': function() {
    var query_string, parsed;
    for (var i = 0; i < query_string_identities['escaping'].length; i++) {
      query_string = query_string_identities['escaping'][i].query_string;
      parsed       = query_string_identities['escaping'][i].parsed;
      qs.stringify(parsed).should.eql(query_string);
    }
  },
  'test nested': function() {
    var query_string, parsed;
    for (var i = 0; i < query_string_identities['nested'].length; i++) {
      query_string = query_string_identities['nested'][i].query_string;
      parsed       = query_string_identities['nested'][i].parsed;
      qs.stringify(parsed).should.eql(query_string);
    }
  }
};