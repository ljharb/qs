'use strict';

/** @typedef {import('./utils').Charset} Charset */
/** @typedef {import('./utils').UtilOptions} UtilOptions */
/** @typedef {import('./formats').Formatter} Formatter */
/** @typedef {import('./utils').Encoder} Encoder */

/** @callback arrayPrefixGenerator
 *
 * @param {string} prefix
 * @param {string=} key
 * @returns {string}
 */

/**
 * @template T
 * @callback Filter
 * @param {string} prefix
 * @param {T} obj
 * @returns T
 */

/**
 * @callback Comparator
 *
 * @param {*} a
 * @param {*} b
 * @returns {number}
 */

/** @typedef StringifyOptionsInternalType
 *
 * @property {ArrayFormat} arrayFormat
 * @property {boolean} charsetSentinel
 * @property {string | RegExp} delimiter
 * @property {boolean} encode
 * @property {Encoder} encoder
 * @property {boolean} encodeValuesOnly
 * @property {Filter<*> | Array<string | number>} filter
 * @property {string} format
 * @property {boolean} skipNulls
 * @property {boolean} strictNullHandling
 * @property {DateSerializer} serializeDate
 * @property {Comparator} sort
 */
/** @typedef {UtilOptions & StringifyOptionsInternalType} StringifyOptionsInternal */

/** @typedef StringifyOptionsType
 *
 * @property {(Encoder | null)=} encoder
 * @property {boolean=} addQueryPrefix
 * @property {boolean=} indices
 */
/** @typedef {Partial<StringifyOptionsInternal> & StringifyOptionsType} StringifyOptions */

/** @callback DateSerializer
 * @param {Date} date
 * @returns {string | number}
 */

var utils = require('./utils');
var formats = require('./formats');

/** @typedef {string} ArrayFormat
 *
 * @enum {ArrayFormat}
 * @type {Object.<ArrayFormat, arrayPrefixGenerator>}
 * @readonly
*/
var arrayPrefixGenerators = {
    /** @type {arrayPrefixGenerator} */
    brackets: function brackets(prefix) { // eslint-disable-line func-name-matching
        return prefix + '[]';
    },
    /** @type {arrayPrefixGenerator} */
    indices: function indices(prefix, key) { // eslint-disable-line func-name-matching
        return prefix + '[' + key + ']';
    },
    /** @type {arrayPrefixGenerator} */
    repeat: function repeat(prefix) { // eslint-disable-line func-name-matching
        return prefix;
    }
};

var toISO = Date.prototype.toISOString;

/** @type {StringifyOptions & Pick<StringifyOptionsInternal, "encoder" | "allowDots">} */
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    /** @deprecated */
    indices: false,
    /** @type DateSerializer */
    serializeDate: function serializeDate(date) { // eslint-disable-line func-name-matching
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var stringify = function stringify( // eslint-disable-line func-name-matching
    /** @type {object | Date | null | undefined | string | number | boolean} */ object,
    /** @type {string} */ prefix,
    /** @type {arrayPrefixGenerator} */ generateArrayPrefix,
    /** @type {boolean} */ strictNullHandling,
    /** @type {boolean} */ skipNulls,
    /** @type {Encoder} */ encoder,
    /** @type {Filter<*>} */ filter,
    /** @type {Comparator} */ sort,
    /** @type {boolean} */ allowDots,
    /** @type {DateSerializer} */ serializeDate,
    /** @type {Formatter} */ formatter,
    /** @type {boolean} */ encodeValuesOnly,
    /** @type {Charset} */ charset
) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix, defaults.encoder, charset) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset);
            return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults.encoder, charset))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    /** @type {array} */
    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            /** @type {array} */
            values = values.concat(stringify(
                obj[key],
                generateArrayPrefix(prefix, key),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly,
                charset
            ));
        } else {
            /** @type {array} */
            values = values.concat(stringify(
                obj[key],
                prefix + (allowDots ? '.' + key : '[' + key + ']'),
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encoder,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly,
                charset
            ));
        }
    }

    return values;
};

/**
 * @param object {object}
 * @param opts {StringifyOptions=}
 * @returns string
 */
module.exports = function (object, opts) {
    var obj = object;
    var options = opts ? utils.assign({}, opts) : {};

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = typeof options.encoder === 'function' ? options.encoder : defaults.encoder;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? defaults.allowDots : !!options.allowDots;
    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    var encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults.encodeValuesOnly;

    /** @type {Charset} */
    var charset = options.charset || defaults.charset;
    if (typeof options.charset !== 'undefined' && options.charset !== 'utf-8' && options.charset !== 'iso-8859-1') {
        throw new Error('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    if (typeof options.format === 'undefined') {
        options.format = formats['default'];
    } else if (!Object.prototype.hasOwnProperty.call(formats.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    var formatter = formats.formatters[options.format];
    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    /** @type {Array<string | Buffer>} */
    var keys = [];

    if (typeof obj !== 'object' || obj === null) {
        return '';
    }

    /** @type {ArrayFormat} */
    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        /** @type {string[]} */
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(stringify(
            obj[key],
            key,
            generateArrayPrefix,
            strictNullHandling,
            skipNulls,
            encode ? encoder : null,
            filter,
            sort,
            allowDots,
            serializeDate,
            formatter,
            encodeValuesOnly,
            charset
        ));
    }

    var joined = keys.join(delimiter);
    var prefix = options.addQueryPrefix === true ? '?' : '';

    if (options.charsetSentinel) {
        if (charset === 'iso-8859-1') {
            // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
            prefix += 'utf8=%26%2310003%3B&';
        } else {
            // encodeURIComponent('✓')
            prefix += 'utf8=%E2%9C%93&';
        }
    }

    return joined.length > 0 ? prefix + joined : '';
};
