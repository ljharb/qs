'use strict';

var test = require('tape');
var execFile = require('child_process').execFile;
var path = require('path');
var stringify = require('../lib/stringify');

test('cycle detection through storage-only side channel', function (t) {
    var shared = { value: 'x' };
    var cyclic = {};
    cyclic.self = cyclic;
    t.equal(stringify({ a: shared, b: shared }), 'a%5Bvalue%5D=x&b%5Bvalue%5D=x', 'shared values are not cycles');
    t['throws'](function () { stringify(cyclic); }, /Cyclic object value/, 'cycles retain the existing error');
    t.end();
});

test('the qs API does not load the assertion formatter', function (t) {
    var script = [
        "var Module = require('module');",
        'var load = Module._load;',
        'Module._load = function (request) {',
        "  if (request === 'object-inspect') { throw new Error('unexpected assertion formatter'); }",
        '  return load.apply(this, arguments);',
        '};',
        'require(' + JSON.stringify(path.resolve(__dirname, '../lib')) + ');'
    ].join('\n');
    execFile(process.execPath, ['-e', script], function (error, stdout, stderr) {
        t.error(error, stderr || stdout || 'parse, stringify, and utils load without object-inspect');
        t.end();
    });
});
