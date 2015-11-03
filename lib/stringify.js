'use strict';

// Load modules

const Utils = require('./utils');


// Declare internals

const internals = {
    delimiter: '&',
    arrayPrefixGenerators: {
        brackets: function (prefix, key) {

            return prefix + '[]';
        },
        indices: function (prefix, key) {

            return prefix + '[' + key + ']';
        },
        repeat: function (prefix, key) {

            return prefix;
        }
    },
    strictNullHandling: false,
    skipNulls: false,
    encode: true
};


internals.stringify = function (obj, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort) {

    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    }
    else if (Utils.isBuffer(obj)) {
        obj = obj.toString();
    }
    else if (obj instanceof Date) {
        obj = obj.toISOString();
    }
    else if (obj === null) {
        if (strictNullHandling) {
            return encode ? Utils.encode(prefix) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' ||
        typeof obj === 'number' ||
        typeof obj === 'boolean') {

        if (encode) {
            return [Utils.encode(prefix) + '=' + Utils.encode(obj)];
        }
        return [prefix + '=' + obj];
    }

    let values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    let objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    }
    else {
        const keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (let i = 0; i < objKeys.length; ++i) {
        const key = objKeys[i];

        if (skipNulls &&
            obj[key] === null) {

            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(internals.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, skipNulls, encode, filter));
        }
        else {
            values = values.concat(internals.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix, strictNullHandling, skipNulls, encode, filter));
        }
    }

    return values;
};


module.exports = function (obj, options) {

    options = options || {};
    const delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;
    const strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : internals.strictNullHandling;
    const skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : internals.skipNulls;
    const encode = typeof options.encode === 'boolean' ? options.encode : internals.encode;
    const sort = typeof options.sort === 'function' ? options.sort : null;
    let objKeys;
    let filter;
    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    }
    else if (Array.isArray(options.filter)) {
        objKeys = filter = options.filter;
    }

    let keys = [];

    if (typeof obj !== 'object' ||
        obj === null) {

        return '';
    }

    let arrayFormat;
    if (options.arrayFormat in internals.arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    }
    else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    }
    else {
        arrayFormat = 'indices';
    }

    const generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (let i = 0; i < objKeys.length; ++i) {
        const key = objKeys[i];

        if (skipNulls &&
            obj[key] === null) {

            continue;
        }

        keys = keys.concat(internals.stringify(obj[key], key, generateArrayPrefix, strictNullHandling, skipNulls, encode, filter, sort));
    }

    return keys.join(delimiter);
};
