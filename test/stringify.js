'use strict';

/* eslint no-extend-native:0 */
// Load modules

const Code = require('code');
const Lab = require('lab');
const Qs = require('../');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.experiment;
const it = lab.test;


describe('stringify()', () => {

    it('stringifies a querystring object', (done) => {

        expect(Qs.stringify({ a: 'b' })).to.equal('a=b');
        expect(Qs.stringify({ a: 1 })).to.equal('a=1');
        expect(Qs.stringify({ a: 1, b: 2 })).to.equal('a=1&b=2');
        expect(Qs.stringify({ a: 'A_Z' })).to.equal('a=A_Z');
        expect(Qs.stringify({ a: '€' })).to.equal('a=%E2%82%AC');
        expect(Qs.stringify({ a: '' })).to.equal('a=%EE%80%80');
        expect(Qs.stringify({ a: 'א' })).to.equal('a=%D7%90');
        expect(Qs.stringify({ a: '𐐷' })).to.equal('a=%F0%90%90%B7');
        done();
    });

    it('stringifies a nested object', (done) => {

        expect(Qs.stringify({ a: { b: 'c' } })).to.equal('a%5Bb%5D=c');
        expect(Qs.stringify({ a: { b: { c: { d: 'e' } } } })).to.equal('a%5Bb%5D%5Bc%5D%5Bd%5D=e');
        done();
    });

    it('stringifies an array value', (done) => {

        expect(Qs.stringify({ a: ['b', 'c', 'd'] })).to.equal('a%5B0%5D=b&a%5B1%5D=c&a%5B2%5D=d');
        done();
    });

    it('omits nulls when asked', (done) => {

        expect(Qs.stringify({ a: 'b', c: null }, { skipNulls: true })).to.equal('a=b');
        done();
    });


    it('omits nested nulls when asked', (done) => {

        expect(Qs.stringify({ a: { b: 'c', d: null } }, { skipNulls: true })).to.equal('a%5Bb%5D=c');
        done();
    });

    it('omits array indices when asked', (done) => {

        expect(Qs.stringify({ a: ['b', 'c', 'd'] }, { indices: false })).to.equal('a=b&a=c&a=d');
        done();
    });

    it('stringifies a nested array value', (done) => {

        expect(Qs.stringify({ a: { b: ['c', 'd'] } })).to.equal('a%5Bb%5D%5B0%5D=c&a%5Bb%5D%5B1%5D=d');
        done();
    });

    it('stringifies an object inside an array', (done) => {

        expect(Qs.stringify({ a: [{ b: 'c' }] })).to.equal('a%5B0%5D%5Bb%5D=c');
        expect(Qs.stringify({ a: [{ b: { c: [1] } }] })).to.equal('a%5B0%5D%5Bb%5D%5Bc%5D%5B0%5D=1');
        done();
    });

    it('does not omit object keys when indices = false', (done) => {

        expect(Qs.stringify({ a: [{ b: 'c' }] }, { indices: false })).to.equal('a%5Bb%5D=c');
        done();
    });

    it('uses indices notation for arrays when indices=true', (done) => {

        expect(Qs.stringify({ a: ['b', 'c'] }, { indices: true })).to.equal('a%5B0%5D=b&a%5B1%5D=c');
        done();
    });

    it('uses indices notation for arrays when no arrayFormat is specified', (done) => {

        expect(Qs.stringify({ a: ['b', 'c'] })).to.equal('a%5B0%5D=b&a%5B1%5D=c');
        done();
    });

    it('uses indices notation for arrays when no arrayFormat=indices', (done) => {

        expect(Qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'indices' })).to.equal('a%5B0%5D=b&a%5B1%5D=c');
        done();
    });

    it('uses repeat notation for arrays when no arrayFormat=repeat', (done) => {

        expect(Qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'repeat' })).to.equal('a=b&a=c');
        done();
    });

    it('uses brackets notation for arrays when no arrayFormat=brackets', (done) => {

        expect(Qs.stringify({ a: ['b', 'c'] }, { arrayFormat: 'brackets' })).to.equal('a%5B%5D=b&a%5B%5D=c');
        done();
    });

    it('stringifies a complicated object', (done) => {

        expect(Qs.stringify({ a: { b: 'c', d: 'e' } })).to.equal('a%5Bb%5D=c&a%5Bd%5D=e');
        done();
    });

    it('stringifies an empty value', (done) => {

        expect(Qs.stringify({ a: '' })).to.equal('a=');
        expect(Qs.stringify({ a: null }, { strictNullHandling: true })).to.equal('a');

        expect(Qs.stringify({ a: '', b: '' })).to.equal('a=&b=');
        expect(Qs.stringify({ a: null, b: '' }, { strictNullHandling: true })).to.equal('a&b=');

        expect(Qs.stringify({ a: { b: '' } })).to.equal('a%5Bb%5D=');
        expect(Qs.stringify({ a: { b: null } }, { strictNullHandling: true })).to.equal('a%5Bb%5D');
        expect(Qs.stringify({ a: { b: null } }, { strictNullHandling: false })).to.equal('a%5Bb%5D=');

        done();
    });

    it('stringifies an empty object', (done) => {

        const obj = Object.create(null);
        obj.a = 'b';
        expect(Qs.stringify(obj)).to.equal('a=b');
        done();
    });

    it('returns an empty string for invalid input', (done) => {

        expect(Qs.stringify(undefined)).to.equal('');
        expect(Qs.stringify(false)).to.equal('');
        expect(Qs.stringify(null)).to.equal('');
        expect(Qs.stringify('')).to.equal('');
        done();
    });

    it('stringifies an object with an empty object as a child', (done) => {

        const obj = {
            a: Object.create(null)
        };

        obj.a.b = 'c';
        expect(Qs.stringify(obj)).to.equal('a%5Bb%5D=c');
        done();
    });

    it('drops keys with a value of undefined', (done) => {

        expect(Qs.stringify({ a: undefined })).to.equal('');

        expect(Qs.stringify({ a: { b: undefined, c: null } }, { strictNullHandling: true })).to.equal('a%5Bc%5D');
        expect(Qs.stringify({ a: { b: undefined, c: null } }, { strictNullHandling: false })).to.equal('a%5Bc%5D=');
        expect(Qs.stringify({ a: { b: undefined, c: '' } })).to.equal('a%5Bc%5D=');
        done();
    });

    it('url encodes values', (done) => {

        expect(Qs.stringify({ a: 'b c' })).to.equal('a=b%20c');
        done();
    });

    it('stringifies a date', (done) => {

        const now = new Date();
        const str = 'a=' + encodeURIComponent(now.toISOString());
        expect(Qs.stringify({ a: now })).to.equal(str);
        done();
    });

    it('stringifies the weird object from qs', (done) => {

        expect(Qs.stringify({ 'my weird field': '~q1!2"\'w$5&7/z8)?' })).to.equal('my%20weird%20field=~q1%212%22%27w%245%267%2Fz8%29%3F');
        done();
    });

    it('skips properties that are part of the object prototype', (done) => {

        Object.prototype.crash = 'test';
        expect(Qs.stringify({ a: 'b' })).to.equal('a=b');
        expect(Qs.stringify({ a: { b: 'c' } })).to.equal('a%5Bb%5D=c');
        delete Object.prototype.crash;
        done();
    });

    it('stringifies boolean values', (done) => {

        expect(Qs.stringify({ a: true })).to.equal('a=true');
        expect(Qs.stringify({ a: { b: true } })).to.equal('a%5Bb%5D=true');
        expect(Qs.stringify({ b: false })).to.equal('b=false');
        expect(Qs.stringify({ b: { c: false } })).to.equal('b%5Bc%5D=false');
        done();
    });

    it('stringifies buffer values', (done) => {

        expect(Qs.stringify({ a: new Buffer('test') })).to.equal('a=test');
        expect(Qs.stringify({ a: { b: new Buffer('test') } })).to.equal('a%5Bb%5D=test');
        done();
    });

    it('stringifies an object using an alternative delimiter', (done) => {

        expect(Qs.stringify({ a: 'b', c: 'd' }, { delimiter: ';' })).to.equal('a=b;c=d');
        done();
    });

    it('doesn\'t blow up when Buffer global is missing', (done) => {

        const tempBuffer = global.Buffer;
        delete global.Buffer;
        const result = Qs.stringify({ a: 'b', c: 'd' });
        global.Buffer = tempBuffer;
        expect(result).to.equal('a=b&c=d');
        done();
    });

    it('selects properties when filter=array', (done) => {

        expect(Qs.stringify({ a: 'b' }, { filter: ['a'] })).to.equal('a=b');
        expect(Qs.stringify({ a: 1 }, { filter: [] })).to.equal('');
        expect(Qs.stringify({ a: { b: [1, 2, 3, 4], c: 'd' }, c: 'f' }, { filter: ['a', 'b', 0, 2] })).to.equal('a%5Bb%5D%5B0%5D=1&a%5Bb%5D%5B2%5D=3');
        done();

    });

    it('supports custom representations when filter=function', (done) => {

        let calls = 0;
        const obj = { a: 'b', c: 'd', e: { f: new Date(1257894000000) } };
        const filterFunc = function (prefix, value) {

            calls++;
            if (calls === 1) {
                expect(prefix).to.be.empty();
                expect(value).to.equal(obj);
            }
            else if (prefix === 'c') {
                return;
            }
            else if (value instanceof Date) {
                expect(prefix).to.equal('e[f]');
                return value.getTime();
            }
            return value;
        };

        expect(Qs.stringify(obj, { filter: filterFunc })).to.equal('a=b&e%5Bf%5D=1257894000000');
        expect(calls).to.equal(5);
        done();

    });

    it('can disable uri encoding', (done) => {

        expect(Qs.stringify({ a: 'b' }, { encode: false })).to.equal('a=b');
        expect(Qs.stringify({ a: { b: 'c' } }, { encode: false })).to.equal('a[b]=c');
        expect(Qs.stringify({ a: 'b', c: null }, { strictNullHandling: true, encode: false })).to.equal('a=b&c');
        done();
    });

    it('can sort the keys', (done) => {

        const sort = (a, b) => a.localeCompare(b);
        expect(Qs.stringify({ a: 'c', z: 'y', b: 'f' }, { sort: sort })).to.equal('a=c&b=f&z=y');
        expect(Qs.stringify({ a: 'c', z: { j: 'a', i: 'b' }, b: 'f' }, { sort: sort })).to.equal('a=c&b=f&z%5Bi%5D=b&z%5Bj%5D=a');
        done();
    });
});
