var internals = {};

internals.decode = function (str) {

    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};

internals.basicParse = function (str) {

    var obj = {};
    var parts = str.split('&');

    parts.forEach(function (part) {

        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
            obj[internals.decode(part)] = '';
        }
        else {
            var key = internals.decode(part.slice(0, pos));
            var val = internals.decode(part.slice(pos + 1));

            if (!obj[key]) {
                obj[key] = val;
            }
            else {
                obj[key] = [].concat([obj[key], val]);
            }
        }
    });

    return obj;
};

internals.compact = function (obj) {

    if (typeof obj !== 'object') {
        return obj;
    }

    var compacted = {};

    Object.keys(obj).forEach(function (key) {

        if (obj[key] instanceof Array) {
            compacted[key] = [];

            for (var i = 0, l = obj[key].length; i < l; i++) {
                if (obj[key].hasOwnProperty(i) && obj[key][i]) {
                    compacted[key].push(obj[key][i]);
                }
            }
        }
        else {
            compacted[key] = internals.compact(obj[key]);
        }
    });

    return compacted;
};

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
            // already exists as an array, so convert it to an object
            if (obj[root] instanceof Array) {
                var tempObj = {};
                Object.keys(obj[root]).forEach(function (key) {
                    tempObj[key] = obj[root][key];
                });

                obj[root] = tempObj;
            }

            if (!obj[root]) {
                obj[root] = {};
            }

            internals.setKey(obj[root], chain, val);
        }
        else {
            // we want an array, but index is not specified
            if (!index[1]) {
                if (!obj[root]) {
                    obj[root] = [].concat(val);
                }
                else {
                    obj[root][val] = '';
                }
            }
            else {
                if (!obj[root]) {
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
    if (parts) {
        var keys = parts.filter(function (part) {

            return typeof part !== 'undefined' && part !== '' && !Object.prototype.hasOwnProperty(part);
        }).slice(1);

        internals.setKey(result, keys, val);
    }

    return result;
};

exports.parse = function (str, depth) {

    // use node's native querystring module to do the initial parse
    // this takes care of things like url decoding, as well as the splitting
    if (str === '' || str === null || typeof str === 'undefined') {
        return {};
    }

    var tempObj = internals.basicParse(str);
    var obj = {};

    // iterate over the keys and setup the new object
    Object.keys(tempObj).forEach(function (key) {

        internals.parseNest(key, tempObj[key], depth, obj);
    });

    return internals.compact(obj);
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

        values = values.concat(internals.stringify(obj[key], prefix + '[' + encodeURIComponent(key) + ']'));
    });

    return values;
};

exports.stringify = function (obj, prefix) {

    var keys = [];
    var value = JSON.parse(JSON.stringify(obj));

    Object.keys(value).forEach(function (key) {

        keys = keys.concat(internals.stringify(value[key], encodeURIComponent(key)));
    });

    return keys.join('&');
};
