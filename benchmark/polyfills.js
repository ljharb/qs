'use strict';

/**
 * Polyfills for older Node.js versions (0.8+)
 * This file provides implementations for features not available in older Node versions
 */

// Polyfill for Array.from (ES6)
if (!Array.from) {
    Array.from = function (arrayLike, mapFn, thisArg) {
        var result = [];
        var length, i;

        if (arrayLike == null) {
            throw new TypeError('Array.from requires an array-like object');
        }

        length = arrayLike.length >>> 0;

        for (i = 0; i < length; i++) {
            if (i in arrayLike) {
                if (mapFn) {
                    result[i] = mapFn.call(thisArg, arrayLike[i], i, arrayLike);
                } else {
                    result[i] = arrayLike[i];
                }
            }
        }

        return result;
    };
}

// Polyfill for String.prototype.repeat (ES6)
if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count === Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }

        count = Math.floor(count);
        if (this.length === 0 || count === 0) {
            return '';
        }

        var result = '';
        var pattern = this;

        while (count > 0) {
            if (count & 1) {
                result += pattern;
            }
            count >>= 1;
            pattern += pattern;
        }

        return result;
    };
}

// Polyfill for Object.fromEntries (ES2019)
if (!Object.fromEntries) {
    Object.fromEntries = function (entries) {
        var obj = {};

        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
            if (Object.prototype.toString.call(entry) !== '[object Array]') {
                throw new TypeError('Iterator value ' + entry + ' is not an entry object');
            }
            obj[entry[0]] = entry[1];
        }

        return obj;
    };
}

// Polyfill for Object.entries (ES2017)
if (!Object.entries) {
    Object.entries = function (obj) {
        var ownProps = Object.keys(obj);
        var i = ownProps.length;
        var resArray = new Array(i);

        while (i--) {
            resArray[i] = [ownProps[i], obj[ownProps[i]]];
        }

        return resArray;
    };
}

// Simplified polyfill for Promise (ES6) for Node.js 0.8+
// For complex usage, consider using a full Promise library like Q or Bluebird
if (typeof Promise === 'undefined') {
    global.Promise = function (executor) {
        var callbacks = [];
        var value;
        var resolved = false;

        this.then = function (onFulfilled) {
            if (resolved) {
                onFulfilled(value);
            } else {
                callbacks.push(onFulfilled);
            }
            return this;
        };

        function resolve(val) {
            value = val;
            resolved = true;

            for (var i = 0; i < callbacks.length; i++) {
                callbacks[i](value);
            }
            callbacks = [];
        }

        executor(resolve);
    };
}

// Ensure fs.mkdirSync recursive option works (Node.js 10+)
// This is a simple version that doesn't handle all edge cases
var fs = require('fs');
var path = require('path');

var originalMkdirSync = fs.mkdirSync;
fs.mkdirSync = function (dirPath, options) {
    if (options && options.recursive) {
        var parts = dirPath.split(path.sep);
        var currentPath = '';

        for (var i = 0; i < parts.length; i++) {
            if (!parts[i] && i === 0) {
                currentPath = path.sep;
                continue;
            }

            currentPath = path.join(currentPath, parts[i]);

            try {
                fs.statSync(currentPath);
            } catch (e) {
                originalMkdirSync(currentPath);
            }
        }
        return;
    }

    return originalMkdirSync.apply(this, arguments);
};

// Ensure Array includes method (ES7)
if (!Array.prototype.includes) {
    Array.prototype.includes = function (searchElement, fromIndex) {
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        var o = Object(this);
        var len = o.length >>> 0;

        if (len === 0) {
            return false;
        }

        var n = fromIndex | 0;
        var k = Math.max(n >= 0 ? n : len + n, 0);

        while (k < len) {
            if (o[k] === searchElement) {
                return true;
            }
            k++;
        }
        return false;
    };
}

module.exports = {
    loaded: true
};
