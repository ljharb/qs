/* eslint no-extend-native:0 */
// Load modules

var Code = require('code');
var Lab = require('lab');
var merge = require('../lib/utils').merge;

// Declare internals

var internals = {};


// Test shortcuts

var lab = exports.lab = Lab.script();
var expect = Code.expect;
var describe = lab.experiment;
var it = lab.test;

describe('merge()', function () {
    it('merge two query objects', function (done) {
        var exisitingQuery = {userId: "12345"};
        var newUserQuery = {userId: "76432"};
        expect(merge(exisitingQuery, newUserQuery)).to.deep.equal(newUserQuery);
        done();
    });
});
