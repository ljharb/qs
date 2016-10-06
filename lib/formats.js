'use strict';

module.exports = {
    'default': 'RFC3986',
    formatters: {
        RFC1738: function (value) {
            return String(value).replace(/%20/g, '+');
        },
        RFC3986: function (value) {
            return value;
        }
    },
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};
