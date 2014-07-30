var Querystring = require('querystring');

var internals = {};

internals.setKey = function (obj, chain, val) {

    var root = chain.shift();

    if (chain.length > 1) {
        obj[root] = {};
        internals.setKey(obj[root], chain, val);
    }
    else if (chain.length === 1) {
        // check if the next key is [] or [0]
        var index = /\[(\d+)?\]/.exec(chain[0]);

        // it's not, so continue as normal
        if (!index) {
            obj[root] = {};
            internals.setKey(obj[root], chain, val);
        }
        else {
            // we want an array, but index is not specified
            if (!index[1]) {
                obj[root] = [].concat(val);
            }
            else {
                // we want an array, and we care about index
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

    // the regex chunks
    var parent = '^([^\\[\\]]+)';
    var child = '(?:\\[([^\\[\\]0-9]+)\\])?';
    var rest = '(.*)$';

    // combine the chunks into a single string with the appropriate depth
    var ar = new Array(depth + 1);
    var re = parent + ar.join(child) + rest;

    // create the regex object
    var matcher = new RegExp(re);

    // execute the regex
    var parts = matcher.exec(key);
    // this narrows down the regex return to an array of only the desired keys
    var keys = parts.filter(function (part) { return typeof part !== 'undefined' && part !== '' }).slice(1);

    internals.setKey(result, keys, val);

    return result;
};

exports.parse = function (str, depth) {

    // use node's native querystring module to do the initial parse
    // this takes care of things like url decoding, as well as the splitting
    var tempObj = Querystring.parse(str);
    var obj = {};

    // iterate over the keys and setup the new object
    Object.keys(tempObj).forEach(function (key) {

        internals.parseNest(key, tempObj[key], depth, obj);
    });

    return obj;
};

internals.stringify = function (obj, prefix) {

    if (typeof obj === 'string' || typeof obj === 'number') {
        return [prefix + '=' + encodeURIComponent(obj)];
    }

    if (obj === null) {
        return [prefix];
    }

    var values = [];

    Object.keys(obj).forEach(function (key) {

        values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']'));
    });

    return values;
};

exports.stringify = function (obj, prefix) {

    var keys = [];
    var value = JSON.parse(JSON.stringify(obj));

    Object.keys(value).forEach(function (key) {

        keys = keys.concat(internals.stringify(value[key], key));
    });

    return keys.join('&');
};
