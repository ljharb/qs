'use strict';

/** @type {function(string | RegExp, string): string} */
var replace = String.prototype.replace;
var percentTwenties = /%20/g;

/** @typedef {'RFC1738' | 'RFC3986'} Format */
/** @callback Formatter
 *
 * @param {string | Buffer} value
 * @returns {string}
 */

/** @type {{
 *   default: Format,
 *   formatters: { [s: string]: Formatter },
 *   RFC1738: 'RFC1738',
 *   RFC3986: 'RFC3986',
 * }} */
module.exports = {
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
