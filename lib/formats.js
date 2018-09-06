'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

/** @callback Formatter
 *
 * @param {string | Buffer} value
 * @returns {string}
 */

module.exports = {
    'default': 'RFC3986',
    formatters: {
        /** @type {Formatter} */
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        /** @type {Formatter} */
        RFC3986: function (value) {
            return value;
        }
    },
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};
