'use strict';

var test = require('tape');
var utils = require('../lib/utils');

test('merge()', function (t) {
    t.deepEqual(utils.merge(null, true), [null, true], 'merges true into null');

    t.deepEqual(utils.merge(null, [42]), [null, 42], 'merges null into an array');

    t.deepEqual(utils.merge({ a: 'b' }, { a: 'c' }), { a: ['b', 'c'] }, 'merges two objects with the same key');

    var oneMerged = utils.merge({ foo: 'bar' }, { foo: { first: '123' } });
    t.deepEqual(oneMerged, { foo: ['bar', { first: '123' }] }, 'merges a standalone and an object into an array');

    var twoMerged = utils.merge({ foo: ['bar', { first: '123' }] }, { foo: { second: '456' } });
    t.deepEqual(twoMerged, { foo: { 0: 'bar', 1: { first: '123' }, second: '456' } }, 'merges a standalone and two objects into an array');

    var sandwiched = utils.merge({ foo: ['bar', { first: '123', second: '456' }] }, { foo: 'baz' });
    t.deepEqual(sandwiched, { foo: ['bar', { first: '123', second: '456' }, 'baz'] }, 'merges an object sandwiched by two standalones into an array');

    var nestedArrays = utils.merge({ foo: ['baz'] }, { foo: ['bar', 'xyzzy'] });
    t.deepEqual(nestedArrays, { foo: ['baz', 'bar', 'xyzzy'] });

    var noOptionsNonObjectSource = utils.merge({ foo: 'baz' }, 'bar');
    t.deepEqual(noOptionsNonObjectSource, { foo: 'baz', bar: true });

    t.end();
});
