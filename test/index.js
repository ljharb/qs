var Riddler = require('../');
var Lab = require('lab');

var describe = Lab.experiment;
var expect = Lab.expect;
var it = Lab.test;

describe('Riddler', function () {

    it('parses a simple string', function (done) {

        expect(Riddler.parse('a=b')).to.deep.equal({ a: 'b' });
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
        done();
    });

    it('allows to specify array indices', function (done) {

        expect(Riddler.parse('a[1]=c&a[0]=b')).to.deep.equal({ a: ['b', 'c'] });
        done();
    });

    it('is ok with url encoded strings', function (done) {

        expect(Riddler.parse('a[b%20c]=d')).to.deep.equal({ a: { 'b c': 'd' } });
        expect(Riddler.parse('a[b]=c%20d')).to.deep.equal({ a: { b: 'c d' } });
        done();
    });
});
