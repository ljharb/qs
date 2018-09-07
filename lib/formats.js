'use strict';

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var util = require('./utils');

/** @callback Formatter
 *
 * @param {string | Buffer} value
 * @returns {string}
 */

/** @typedef {string} Format
 *
 * @enum {Format}
 * @type {Object.<Format, Format>}
 * @readonly
 */
var Format = {
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

module.exports = util.assign(
    {
        'default': /** @type Format */ 'RFC3986',
        /** @type {Object.<Format, Formatter>} */
        formatters: {
            /** @type {Formatter} */
            RFC1738: function (value) {
                return replace.call(value, percentTwenties, '+');
            },
            /** @type {Formatter} */
            RFC3986: function (value) {
                return value;
            }
        }
    },
    Format
);
