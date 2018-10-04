'use strict';
/** @typedef {import('./utils').UtilOptions} UtilOptions */
/** @typedef {import('./utils').Encoder} Encoder */
/** @typedef {import('./utils').Charset} Charset */

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
 * @param {Value} a
 * @param {Value} b
 * @returns {number}
 */
/** @callback DateSerializer
 * @param {Date} date
 * @returns {string | number}
 */
/** @typedef {'brackets' | 'indices' | 'repeat'} ArrayFormat */
/** @typedef StringifyOptionsInternalType
 *
 * @property {ArrayFormat} arrayFormat
 * @property {boolean} charsetSentinel
 * @property {string} delimiter
 * @property {boolean} encode
 * @property {Encoder} encoder
 * @property {boolean} encodeValuesOnly
 * @property {Filter<ObjectCoercible | Nullish> | Array<string | number>} filter
 * @property {import('./formats').Format} format
 * @property {DateSerializer} serializeDate
 * @property {boolean} skipNulls
 * @property {Comparator} sort
 * @property {boolean} strictNullHandling
 */
/** @typedef {UtilOptions & StringifyOptionsInternalType} StringifyOptionsInternal */
 /** @typedef StringifyOptionsType
 *
 * @property {(Encoder | null)=} encoder
 * @property {boolean=} addQueryPrefix
 * @property {boolean=} indices
 */
/** @typedef {Partial<StringifyOptionsInternal> & StringifyOptionsType} StringifyOptions */

var utils = require('./utils');
var formats = require('./formats');

/** @typedef {(prefix: string, key?: string) => string} ArrayPrefixGenerator */
/** @type {{ [format in ArrayFormat]: ArrayPrefixGenerator }}  */
var arrayPrefixGenerators = {
    brackets: function brackets(prefix) { // eslint-disable-line func-name-matching
        return prefix + '[]';
    },
    indices: function indices(prefix, key) { // eslint-disable-line func-name-matching
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) { // eslint-disable-line func-name-matching
        return prefix;
    }
};

var toISO = Date.prototype.toISOString;

/** @type {StringifyOptions & Pick<StringifyOptionsInternal, "serializeDate" | "encoder" | "allowDots" | "charset">} */
var defaults = {
    addQueryPrefix: false,
    allowDots: false,
    charset: 'utf-8',
    charsetSentinel: false,
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    format: formats['default'],
    /** @deprecated */
    indices: false,
    /** @type DateSerializer */
    serializeDate: function serializeDate(date) { // eslint-disable-line func-name-matching
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};
/**
 * @param {Value} object
 * @param {string | number} prefix
 * @param {ArrayPrefixGenerator} generateArrayPrefix
 * @param {boolean | undefined} strictNullHandling
 * @param {boolean | undefined} skipNulls
 * @param {Encoder | null} encoder
 * @param {Filter<Value> | Array<string | number> | undefined} filter
 * @param {Comparator | null} sort
 * @param {boolean} allowDots
 * @param {DateSerializer} serializeDate
 * @param {import('./formats').Formatter} formatter
 * @param {boolean | undefined} encodeValuesOnly
 * @param {Charset} charset
 * @returns {Concatable<string | Buffer>}
*/
var stringify = function stringify( // eslint-disable-line func-name-matching
    object,
    prefix,
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
) {
    prefix = '' + prefix;
    /** @type {string | number | boolean | Buffer | undefined | object} */
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
        var key = '' + objKeys[i];

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
 * @param {ObjectCoercible | Nullish} object
 * @param {StringifyOptions} [opts]
 */
module.exports = function (object, opts) {
    /** @type {StringifyOptions} */
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

    var obj = object;
    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', object);
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
    if (options.arrayFormat && options.arrayFormat in arrayPrefixGenerators) {
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
