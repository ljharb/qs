var Riddler = require('../');
var Lab = require('lab');

var describe = Lab.experiment;
var expect = Lab.expect;
var it = Lab.test;

describe('Riddler.stringify()', function () {

    it('can stringify a querystring object', function (done) {

        expect(Riddler.stringify({ a: 'b' })).to.equal('a=b');
        expect(Riddler.stringify({ a: 1 })).to.equal('a=1');
        expect(Riddler.stringify({ a: 1, b: 2 })).to.equal('a=1&b=2');
        done();
    });

    it('can stringify a nested object', function (done) {

        expect(Riddler.stringify({ a: { b: 'c' } })).to.equal('a[b]=c');
        expect(Riddler.stringify({ a: { b: { c: { d: 'e' } } } })).to.equal('a[b][c][d]=e');
        done();
    });

    it('can stringify an array value', function (done) {

        expect(Riddler.stringify({ a: ['b', 'c', 'd'] })).to.equal('a[0]=b&a[1]=c&a[2]=d');
        done();
    });

    it('can stringify a nested array value', function (done) {

        expect(Riddler.stringify({ a: { b: ['c', 'd'] } })).to.equal('a[b][0]=c&a[b][1]=d');
        done();
    });

    it('can stringify an object inside an array', function (done) {

        expect(Riddler.stringify({ a: [{ b: 'c' }] })).to.equal('a[0][b]=c');
        expect(Riddler.stringify({ a: [{ b: { c: [1] } }] })).to.equal('a[0][b][c][0]=1');
        done();
    });

    it('can stringify a complicated object', function (done) {

        expect(Riddler.stringify({ a: { b: 'c', d: 'e' } })).to.equal('a[b]=c&a[d]=e');
        done();
    });

    it('can stringify an empty value', function (done) {

        expect(Riddler.stringify({ a: '' })).to.equal('a=');
        expect(Riddler.stringify({ a: '', b: '' })).to.equal('a=&b=');
        expect(Riddler.stringify({ a: null })).to.equal('a');
        expect(Riddler.stringify({ a: { b: null } })).to.equal('a[b]');
        done();
    });

    it('drops keys with a value of undefined', function (done) {

        expect(Riddler.stringify({ a: undefined })).to.equal('');
        expect(Riddler.stringify({ a: { b: undefined, c: null } })).to.equal('a[c]');
        done();
    });

    it('url encodes values', function (done) {

        expect(Riddler.stringify({ a: 'b c' })).to.equal('a=b%20c');
        done();
    });

    it('can stringify a date', function (done) {

        var now = new Date();
        var str = 'a=' + encodeURIComponent(now.toISOString());
        expect(Riddler.stringify({ a: now })).to.equal(str);
        done();
    });

    it('can stringify the weird object from qs', function (done) {

        expect(Riddler.stringify({ 'my weird field': "q1!2\"'w$5&7/z8)?" })).to.equal('my%20weird%20field=q1!2%22\'w%245%267%2Fz8)%3F');
        done();
    });
});
