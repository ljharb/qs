'use strict';

/**
 * Polyfills for older Node.js versions (0.8+)
 * This file provides shims using well-maintained npm packages
 */

// Load `Array.from` polyfill
require('array.from/auto');

// Load `String.prototype.repeat` polyfill
require('string.prototype.repeat/auto');

// Load `Object.entries` polyfill
require('object.entries/auto');

// Load `Object.fromEntries` polyfill
require('object.fromentries/auto');

// Load `Array.prototype.includes` polyfill
require('array-includes/auto');

// Load full ES6 shims (includes Promise and many more)
require('es6-shim');

// Patch `fs.mkdirSync` to support recursive (for Node <10)
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
