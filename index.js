var Querystring = require('querystring');
var Hoek = require('hoek');

var internals = {};

internals.parseNest = function (key, val, depth) {

    depth = typeof depth === 'undefined' ? 5 : depth; // default to 5

    var parent = '^([^\\[\\]]+)';
    var child = '(?:\\[([^\\[\\]]+)\\])?';
    var rest = '(.*)$';

    var ar = new Array(depth + 1);
    var re = parent + ar.join(child) + rest;
    var matcher = new RegExp(re);

    var parts = matcher.exec(key);

    var res = {};

    if (!parts) {
        res[key] = val;
        return res;
    }

    var keys = parts.filter(function (part) { return typeof part !== 'undefined' && part !== '' }).slice(1);

    var current = res;
    for (var i = 0, l = keys.length; i < l; i++) {
        if (i === l - 1) {
            current[keys[i]] = val;
        }
        else {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }

    return res;
};

exports.parse = function (str, depth) {

    var tempObj = Querystring.parse(str);
    var obj = {};

    Object.keys(tempObj).forEach(function (key) {

        obj = Hoek.applyToDefaults(obj, internals.parseNest(key, tempObj[key], depth));
    });

    return obj;
};
