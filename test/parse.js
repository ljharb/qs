
var qs = require('../');

describe('qs.parse()', function(){
  it('should support the basics', function(){
    qs.parse('0=foo').should.eql({ '0': 'foo' });

    qs.parse('foo=c++')
      .should.eql({ foo: 'c  ' });

    qs.parse('a[>=]=23')
      .should.eql({ a: { '>=': '23' }});

    qs.parse('a[<=>]==23')
      .should.eql({ a: { '<=>': '=23' }});

    qs.parse('a[==]=23')
      .should.eql({ a: { '==': '23' }});

    qs.parse('foo')
      .should.eql({ foo: '' });

    qs.parse('foo=bar')
      .should.eql({ foo: 'bar' });

    qs.parse('foo%3Dbar=baz')
      .should.eql({ foo: 'bar=baz' });

    qs.parse(' foo = bar = baz ')
      .should.eql({ ' foo ': ' bar = baz ' });

    qs.parse('foo=bar=baz')
      .should.eql({ foo: 'bar=baz' });

    qs.parse('foo=bar&bar=baz')
      .should.eql({ foo: 'bar', bar: 'baz' });

    qs.parse('foo=bar&baz')
      .should.eql({ foo: 'bar', baz: '' });

    qs.parse('cht=p3&chd=t:60,40&chs=250x100&chl=Hello|World')
      .should.eql({
          cht: 'p3'
        , chd: 't:60,40'
        , chs: '250x100'
        , chl: 'Hello|World'
      });
  })

  it('should support nesting', function(){
    qs.parse('ops[>=]=25')
      .should.eql({ ops: { '>=': '25' }});

    qs.parse('user[name]=tj')
      .should.eql({ user: { name: 'tj' }});

    qs.parse('user[name][first]=tj&user[name][last]=holowaychuk')
      .should.eql({ user: { name: { first: 'tj', last: 'holowaychuk' }}});
  })

  it('should support array notation', function(){
    qs.parse('images[]')
      .should.eql({ images: [] });

    qs.parse('user[]=tj')
      .should.eql({ user: ['tj'] });

    qs.parse('user[]=tj&user[]=tobi&user[]=jane')
      .should.eql({ user: ['tj', 'tobi', 'jane'] });

    qs.parse('user[names][]=tj&user[names][]=tyler')
      .should.eql({ user: { names: ['tj', 'tyler'] }});

    qs.parse('user[names][]=tj&user[names][]=tyler&user[email]=tj@vision-media.ca')
      .should.eql({ user: { names: ['tj', 'tyler'], email: 'tj@vision-media.ca' }});

    qs.parse('items=a&items=b')
      .should.eql({ items: ['a', 'b'] });

    qs.parse('user[names]=tj&user[names]=holowaychuk&user[names]=TJ')
      .should.eql({ user: { names: ['tj', 'holowaychuk', 'TJ'] }});

    qs.parse('user[name][first]=tj&user[name][first]=TJ')
      .should.eql({ user: { name: { first: ['tj', 'TJ'] }}});

    var o = qs.parse('existing[fcbaebfecc][name][last]=tj')
    o.should.eql({ existing: { 'fcbaebfecc': { name: { last: 'tj' }}}})
    Array.isArray(o.existing).should.be.false;
  })

  it('should support arrays with indexes', function(){
    qs.parse('foo[0]=bar&foo[1]=baz').should.eql({ foo: ['bar', 'baz'] });
    qs.parse('foo[1]=bar&foo[0]=baz').should.eql({ foo: ['baz', 'bar'] });
    qs.parse('foo[base64]=RAWR').should.eql({ foo: { base64: 'RAWR' }});
    qs.parse('foo[64base]=RAWR').should.eql({ foo: { '64base': 'RAWR' }});
  })

  it('should expand to an array when dupliate keys are present', function(){
    qs.parse('items=bar&items=baz&items=raz')
      .should.eql({ items: ['bar', 'baz', 'raz'] });
  })

  it('should support right-hand side brackets', function(){
    qs.parse('pets=["tobi"]')
      .should.eql({ pets: '["tobi"]' });

    qs.parse('operators=[">=", "<="]')
      .should.eql({ operators: '[">=", "<="]' });

    qs.parse('op[>=]=[1,2,3]')
      .should.eql({ op: { '>=': '[1,2,3]' }});

    qs.parse('op[>=]=[1,2,3]&op[=]=[[[[1]]]]')
          .should.eql({ op: { '>=': '[1,2,3]', '=': '[[[[1]]]]' }});
  })

  it('should support empty values', function(){
    qs.parse('').should.eql({});
    qs.parse(undefined).should.eql({});
    qs.parse(null).should.eql({});
  })

  it('should transform arrays to objects', function(){
    qs.parse('foo[0]=bar&foo[bad]=baz').should.eql({ foo: { 0: "bar", bad: "baz" }});
    qs.parse('foo[bad]=baz&foo[0]=bar').should.eql({ foo: { 0: "bar", bad: "baz" }});
  })

  it('should support malformed uri chars', function(){
    qs.parse('{%:%}').should.eql({ '{%:%}': '' });
    qs.parse('foo=%:%}').should.eql({ 'foo': '%:%}' });
  })

  it('should support semi-parsed strings', function(){
    qs.parse({ 'user[name]': 'tobi' })
      .should.eql({ user: { name: 'tobi' }});

    qs.parse({ 'user[name]': 'tobi', 'user[email][main]': 'tobi@lb.com' })
      .should.eql({ user: { name: 'tobi', email: { main: 'tobi@lb.com' } }});
  })
})