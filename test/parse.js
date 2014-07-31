var Riddler = require('../');
var Lab = require('lab');

var describe = Lab.experiment;
var expect = Lab.expect;
var it = Lab.test;

describe('Riddler.parse()', function () {

    it('parses a simple string', function (done) {

        expect(Riddler.parse('0=foo')).to.deep.equal({ '0': 'foo' });
        expect(Riddler.parse('foo=c++')).to.deep.equal({ foo: 'c  ' });
        expect(Riddler.parse('a[>=]=23')).to.deep.equal({ a: { '>=': '23' } });
        expect(Riddler.parse('a[<=>]==23')).to.deep.equal({ a: { '<=>': '=23' } });
        expect(Riddler.parse('a[==]=23')).to.deep.equal({ a: { '==': '23' } });
        expect(Riddler.parse('foo')).to.deep.equal({ foo: '' });
        expect(Riddler.parse('foo=bar')).to.deep.equal({ foo: 'bar' });
        expect(Riddler.parse(' foo = bar = baz ')).to.deep.equal({ ' foo ': ' bar = baz ' });
        expect(Riddler.parse('foo=bar=baz')).to.deep.equal({ foo: 'bar=baz' });
        expect(Riddler.parse('foo=bar&bar=baz')).to.deep.equal({ foo: 'bar', bar: 'baz' });
        expect(Riddler.parse('foo=bar&baz')).to.deep.equal({ foo: 'bar', baz: '' });
        expect(Riddler.parse('cht=p3&chd=t:60,40&chs=250x100&chl=Hello|World')).to.deep.equal({
            cht: 'p3',
            chd: 't:60,40',
            chs: '250x100',
            chl: 'Hello|World'
        });
        done();
    });

    it('parses a single nested string', function (done) {

        expect(Riddler.parse('a[b]=c')).to.deep.equal({ a: { b: 'c' } });
        done();
    });

    it('parses a double nested string', function (done) {

        expect(Riddler.parse('a[b][c]=d')).to.deep.equal({ a: { b: { c: 'd' } } });
        done();
    });

    it('defaults to a depth of 5', function (done) {

        expect(Riddler.parse('a[b][c][d][e][f][g][h]=i')).to.deep.equal({ a: { b: { c: { d: { e: { f: { '[g][h]': 'i' } } } } } } });
        done();
    });

    it('only parses one level when depth = 1', function (done) {

        expect(Riddler.parse('a[b][c]=d', 1)).to.deep.equal({ a: { b: { '[c]': 'd' } } });
        expect(Riddler.parse('a[b][c][d]=e', 1)).to.deep.equal({ a: { b: { '[c][d]': 'e' } } });
        done();
    });

    it('parses a simple array', function (done) {

        expect(Riddler.parse('a=b&a=c')).to.deep.equal({ a: ['b', 'c'] });
        done();
    });

    it('parses an explicit array', function (done) {

        expect(Riddler.parse('a[]=b')).to.deep.equal({ a: ['b'] });
        expect(Riddler.parse('a[]=b&a[]=c')).to.deep.equal({ a: ['b', 'c'] });
        done();
    });

    it('parses a nested array', function (done) {

        expect(Riddler.parse('a[b][]=c&a[b][]=d')).to.deep.equal({ a: { b: ['c', 'd'] } });
        expect(Riddler.parse('a[>=]=25')).to.deep.equal({ a: { '>=': '25' } });
        done();
    });

    it('allows to specify array indices', function (done) {

        expect(Riddler.parse('a[1]=c&a[0]=b&a[2]=d')).to.deep.equal({ a: ['b', 'c', 'd'] });
        expect(Riddler.parse('a[1]=c&a[0]=b')).to.deep.equal({ a: ['b', 'c'] });
        expect(Riddler.parse('a[1]=c')).to.deep.equal({ a: ['c'] });
        done();
    });

    it('supports encoded = signs', function (done) {

        expect(Riddler.parse('he%3Dllo=th%3Dere')).to.deep.equal({ 'he=llo': 'th=ere' });
        done();
    });

    it('is ok with url encoded strings', function (done) {

        expect(Riddler.parse('a[b%20c]=d')).to.deep.equal({ a: { 'b c': 'd' } });
        expect(Riddler.parse('a[b]=c%20d')).to.deep.equal({ a: { b: 'c d' } });
        done();
    });

    it('allows brackets in the value', function (done) {

        expect(Riddler.parse('pets=["tobi"]')).to.deep.equal({ pets: '["tobi"]' });
        expect(Riddler.parse('operators=[">=", "<="]')).to.deep.equal({ operators: '[">=", "<="]' });
        done();
    });

    it('allows empty values', function (done) {

        expect(Riddler.parse('')).to.deep.equal({});
        expect(Riddler.parse(null)).to.deep.equal({});
        expect(Riddler.parse(undefined)).to.deep.equal({});
        done();
    });

    it('transforms arrays to objects', function (done) {

        expect(Riddler.parse('foo[0]=bar&foo[bad]=baz')).to.deep.equal({ foo: { '0': 'bar', bad: 'baz' } });
        expect(Riddler.parse('foo[bad]=baz&foo[0]=bar')).to.deep.equal({ foo: { bad: 'baz', '0': 'bar' } });
        expect(Riddler.parse('foo[bad]=baz&foo[]=bar')).to.deep.equal({ foo: { bad: 'baz', '0': 'bar' } });
        expect(Riddler.parse('foo[]=bar&foo[bad]=baz')).to.deep.equal({ foo: { '0': 'bar', bad: 'baz' } });
        expect(Riddler.parse('foo[bad]=baz&foo[]=bar&foo[]=foo')).to.deep.equal({ foo: { bad: 'baz', '0': 'bar', '1': 'foo' } });
        done();
    });

    it('supports malformed uri characters', function (done) {

        expect(Riddler.parse('{%:%}')).to.deep.equal({ '{%:%}': '' });
        expect(Riddler.parse('foo=%:%}')).to.deep.equal({ foo: '%:%}' });
        done();
    });

    it('doesn\'t produce empty keys', function (done) {

        expect(Riddler.parse('_r=1&')).to.deep.equal({ '_r': '1' });
        done();
    });

    it('cannot override prototypes', function (done) {

        var obj = Riddler.parse('toString=bad&bad[toString]=bad&constructor=bad');
        expect(typeof obj.toString).to.equal('function');
        expect(typeof obj.bad.toString).to.equal('function');
        expect(typeof obj.constructor).to.equal('function');
        done();
    });

    it('cannot access Object prototype', function (done) {

        Riddler.parse('constructor[prototype][bad]=bad');
        Riddler.parse('bad[constructor][prototype][bad]=bad');
        expect(typeof Object.prototype.bad).to.equal('undefined');
        done();
    });

    it('parses arrays of objects', function (done) {

        expect(Riddler.parse('a[][b]=c')).to.deep.equal({ a: [{ b: 'c' }] });
        expect(Riddler.parse('a[0][b]=c')).to.deep.equal({ a: [{ b: 'c' }] });
        done();
    });

    it('should not throw when a native prototype has an enumerable property', function (done) {

        Object.prototype.crash = '';
        expect(Riddler.parse.bind(null, 'test')).to.not.throw(Error);
        done();
    });

    it('should compact sparse arrays', function (done) {

        expect(Riddler.parse('a[9999]=1&a[2]=2')).to.deep.equal({ a: ['2', '1'] });
        done();
    });
});
