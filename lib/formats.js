'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

/** @type {import('./qs').FormatsExport} */
var formatsExport = {
    'default': 'RFC3986',

    formatters: {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return String(value);
        }
    },

    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

module.exports = formatsExport;
