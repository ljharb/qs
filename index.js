var Querystring = require('querystring');

var internals = {};

internals.setKey = function (obj, chain, val) {

    var root = chain.shift();

    if (chain.length > 1) {
        obj[root] = {};
        internals.setKey(obj[root], chain, val);
    }
    else if (chain.length === 1) {
        var index = /\[(\d+)?\]/.exec(chain[0]);

        if (!index) {
            obj[root] = {};
            internals.setKey(obj[root], chain, val);
        }
        else {
            if (!index[1]) {
                obj[root] = [].concat(val);
            }
            else {
                if (!(obj[root] instanceof Array)) {
                    obj[root] = [];
                }
                obj[root][index[1]] = val;
            }
        }
    }
    else {
        obj[root] = val;
    }
};

internals.parseNest = function (key, val, depth, result) {

    depth = typeof depth === 'undefined' ? 5 : depth; // default to 5

    var parent = '^([^\\[\\]]+)';
    var child = '(?:\\[([^\\[\\]0-9]+)\\])?';
    var rest = '(.*)$';

    var ar = new Array(depth + 1);
    var re = parent + ar.join(child) + rest;
    var matcher = new RegExp(re);

    var parts = matcher.exec(key);
    var keys = parts.filter(function (part) { return typeof part !== 'undefined' && part !== '' }).slice(1);
    internals.setKey(result, keys, val);

    return result;
};

exports.parse = function (str, depth) {

    var tempObj = Querystring.parse(str);
    var obj = {};

    Object.keys(tempObj).forEach(function (key) {

        internals.parseNest(key, tempObj[key], depth, obj);
    });

    return obj;
};
