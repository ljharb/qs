
/**
 * Module dependencies.
 */

var qs = require('../')
  , should = require('should');

module.exports = {
  'test basics': function(){
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
  },
  
  'test nesting': function(){
    qs.parse('user[name]=tj')
      .should.eql({ user: { name: 'tj' }});

    qs.parse('user[name][first]=tj&user[name][last]=holowaychuk')
      .should.eql({ user: { name: { first: 'tj', last: 'holowaychuk' }}});
  },
  
  'test escaping': function(){
    qs.parse('foo=foo%20bar')
      .should.eql({ foo: 'foo bar' });
  },
  
  'test arrays': function(){
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
  },
  
  // 'test complex': function(){
  //   qs.parse('users[][name][first]=tj&users[foo]=bar')
  //     .should.eql({
  //       users: [ { name: 'tj' }, { name: 'tobi' }, { foo: 'bar' }]
  //     });
  // 
  //   qs.parse('users[][name][first]=tj&users[][name][first]=tobi')
  //     .should.eql({
  //       users: [ { name: 'tj' }, { name: 'tobi' }]
  //     });
  // }
};