'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Utils = require('../lib/utils');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.experiment;
const it = lab.test;


describe('merge()', () => {

    it('can merge two objects with the same key', (done) => {

        expect(Utils.merge({ a: 'b' }, { a: 'c' })).to.deep.equal({ a: ['b', 'c'] });
        done();
    });

    it('correctly prunes undefined values when converting an array to an object', (done) => {

        expect(Utils.arrayToObject(['b', undefined, 'c'], {})).to.deep.equal({ '0': 'b', '2': 'c' });
        done();
    });

});
