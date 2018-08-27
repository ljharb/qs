(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.Qs = {})));
}(this, (function (exports) { 'use strict';

    const replace = String.prototype.replace;
    const percentTwenties = /%20/g;

    const formatters = {
        RFC1738: function (value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function (value) {
            return value;
        }
    };

    const RFC1738 = 'RFC1738';
    const RFC3986 = 'RFC3986';

    var formats = /*#__PURE__*/Object.freeze({
        formatters: formatters,
        RFC1738: RFC1738,
        RFC3986: RFC3986,
        default: RFC3986
    });

    const has = Object.prototype.hasOwnProperty;

    const hexTable = (function () {
        const array = [];
        for (let i = 0; i < 256; ++i) {
            array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
        }

        return array;
    }());

    const compactQueue = function compactQueue(queue) {
        let obj;

        while (queue.length) {
            const item = queue.pop();
            obj = item.obj[item.prop];

            if (Array.isArray(obj)) {
                const compacted = [];

                for (let j = 0; j < obj.length; ++j) {
                    if (typeof obj[j] !== 'undefined') {
                        compacted.push(obj[j]);
                    }
                }

                item.obj[item.prop] = compacted;
            }
        }

        return obj;
    };

    const arrayToObject = function arrayToObject(source, options) {
        const obj = options && options.plainObjects ? Object.create(null) : {};
        for (let i = 0; i < source.length; ++i) {
            if (typeof source[i] !== 'undefined') {
                obj[i] = source[i];
            }
        }

        return obj;
    };

    const merge = function merge(target, source, options) {
        if (!source) {
            return target;
        }

        if (typeof source !== 'object') {
            if (Array.isArray(target)) {
                target.push(source);
            } else if (typeof target === 'object') {
                if (options.plainObjects || options.allowPrototypes || !has.call(Object.prototype, source)) {
                    target[source] = true;
                }
            } else {
                return [target, source];
            }

            return target;
        }

        if (typeof target !== 'object') {
            return [target].concat(source);
        }

        let mergeTarget = target;
        if (Array.isArray(target) && !Array.isArray(source)) {
            mergeTarget = arrayToObject(target, options);
        }

        if (Array.isArray(target) && Array.isArray(source)) {
            source.forEach(function (item, i) {
                if (has.call(target, i)) {
                    if (target[i] && typeof target[i] === 'object') {
                        target[i] = merge(target[i], item, options);
                    } else {
                        target.push(item);
                    }
                } else {
                    target[i] = item;
                }
            });
            return target;
        }

        return Object.keys(source).reduce(function (acc, key) {
            const value = source[key];

            if (has.call(acc, key)) {
                acc[key] = merge(acc[key], value, options);
            } else {
                acc[key] = value;
            }
            return acc;
        }, mergeTarget);
    };

    const assign = function assign(target, source) {
        return Object.keys(source).reduce(function (acc, key) {
            acc[key] = source[key];
            return acc;
        }, target);
    };

    const decode = function decode(str, decoder, charset) {
        const strWithoutPlus = str.replace(/\+/g, ' ');
        if (charset === 'iso-8859-1') {
            // unescape never throws, no try...catch needed:
            return strWithoutPlus.replace(/%[0-9a-f]{2}/gi, unescape);
        }
        // utf-8
        try {
            return decodeURIComponent(strWithoutPlus);
        } catch (e) {
            return strWithoutPlus;
        }
    };

    const encode = function encode(str, defaultEncoder, charset) {
        // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
        // It has been adapted here for stricter adherence to RFC 3986
        if (str.length === 0) {
            return str;
        }

        const string = typeof str === 'string' ? str : String(str);

        if (charset === 'iso-8859-1') {
            return escape(string).replace(/%u[0-9a-f]{4}/gi, function ($0) {
                return '%26%23' + parseInt($0.slice(2), 16) + '%3B';
            });
        }

        let out = '';
        for (let i = 0; i < string.length; ++i) {
            let c = string.charCodeAt(i);

            if (
                c === 0x2D // -
                || c === 0x2E // .
                || c === 0x5F // _
                || c === 0x7E // ~
                || (c >= 0x30 && c <= 0x39) // 0-9
                || (c >= 0x41 && c <= 0x5A) // a-z
                || (c >= 0x61 && c <= 0x7A) // A-Z
            ) {
                out += string.charAt(i);
                continue;
            }

            if (c < 0x80) {
                out = out + hexTable[c];
                continue;
            }

            if (c < 0x800) {
                out = out + (hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)]);
                continue;
            }

            if (c < 0xD800 || c >= 0xE000) {
                out = out + (hexTable[0xE0 | (c >> 12)] + hexTable[0x80 | ((c >> 6) & 0x3F)] + hexTable[0x80 | (c & 0x3F)]);
                continue;
            }

            i += 1;
            c = 0x10000 + (((c & 0x3FF) << 10) | (string.charCodeAt(i) & 0x3FF));
            out += hexTable[0xF0 | (c >> 18)]
                + hexTable[0x80 | ((c >> 12) & 0x3F)]
                + hexTable[0x80 | ((c >> 6) & 0x3F)]
                + hexTable[0x80 | (c & 0x3F)];
        }

        return out;
    };

    const compact = function compact(value) {
        const queue = [{ obj: { o: value }, prop: 'o' }];
        const refs = [];

        for (let i = 0; i < queue.length; ++i) {
            const item = queue[i];
            const obj = item.obj[item.prop];

            const keys = Object.keys(obj);
            for (let j = 0; j < keys.length; ++j) {
                const key = keys[j];
                const val = obj[key];
                if (typeof val === 'object' && val !== null && refs.indexOf(val) === -1) {
                    queue.push({ obj: obj, prop: key });
                    refs.push(val);
                }
            }
        }

        return compactQueue(queue);
    };

    const isRegExp = function isRegExp(obj) {
        return Object.prototype.toString.call(obj) === '[object RegExp]';
    };

    const isBuffer = function isBuffer(obj) {
        if (obj === null || typeof obj === 'undefined') {
            return false;
        }

        return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
    };

    const has$1 = Object.prototype.hasOwnProperty;
    const defaults = {
        allowDots: false,
        allowPrototypes: false,
        arrayLimit: 20,
        charset: 'utf-8',
        charsetSentinel: false,
        decoder: decode,
        delimiter: '&',
        depth: 5,
        interpretNumericEntities: false,
        parameterLimit: 1000,
        plainObjects: false,
        strictNullHandling: false
    };

    const interpretNumericEntities = function (str) {
        return str.replace(/&#(\d+);/g, function ($0, numberStr) {
            return String.fromCharCode(parseInt(numberStr, 10));
        });
    };

    // This is what browsers will submit when the ✓ character occurs in an
    // application/x-www-form-urlencoded body and the encoding of the page containing
    // the form is iso-8859-1, or when the submitted form has an accept-charset
    // attribute of iso-8859-1. Presumably also with other charsets that do not contain
    // the ✓ character, such as us-ascii.
    const isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

    // These are the percent-encoded utf-8 octets representing a checkmark, indicating
    // that the request actually is utf-8 encoded.
    const charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

    const parseValues = function parseQueryStringValues(str, options) {
        const obj = {};
        const cleanStr = options.ignoreQueryPrefix ? str.replace(/^\?/, '') : str;
        const limit = options.parameterLimit === Infinity ? undefined : options.parameterLimit;
        const parts = cleanStr.split(options.delimiter, limit);
        let charset = options.charset;
        let skipIndex = -1; // Keep track of where the utf8 sentinel was found

        if (charset !== undefined && charset !== 'utf-8' && charset !== 'iso-8859-1') {
            throw new Error('The charset option must be either utf-8, iso-8859-1, or undefined');
        }

        if (options.charsetSentinel) {
            for (let i = 0; i < parts.length; ++i) {
                if (parts[i].indexOf('utf8=') === 0) {
                    if (parts[i] === charsetSentinel) {
                        charset = 'utf-8';
                    } else if (parts[i] === isoSentinel) {
                        charset = 'iso-8859-1';
                    }
                    skipIndex = i;
                    i = parts.length; // The eslint settings do not allow break;
                }
            }
        }

        for (let i = 0; i < parts.length; ++i) {
            if (i === skipIndex) {
                continue;
            }

            const part = parts[i];
            const bracketEqualsPos = part.indexOf(']=');
            const pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;

            let key;
            let val;

            if (pos === -1) {
                key = options.decoder(part, defaults.decoder, charset);
                val = options.strictNullHandling ? null : '';
            } else {
                key = options.decoder(part.slice(0, pos), defaults.decoder, charset);
                val = options.decoder(part.slice(pos + 1), defaults.decoder, charset);
            }

            if (options.interpretNumericEntities && charset === 'iso-8859-1') {
                val = interpretNumericEntities(val);
            }

            if (has$1.call(obj, key)) {
                obj[key] = [].concat(obj[key]).concat(val);
            } else {
                obj[key] = val;
            }
        }

        return obj;
    };

    const parseObject = function (chain, val, options) {
        let leaf = val;

        for (let i = chain.length - 1; i >= 0; --i) {
            let obj;
            const root = chain[i];

            if (root === '[]' && options.parseArrays) {
                obj = [].concat(leaf);
            } else {
                obj = options.plainObjects ? Object.create(null) : {};
                const cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
                const index = parseInt(cleanRoot, 10);
                if (!options.parseArrays && cleanRoot === '') {
                    obj = { 0: leaf };
                } else if (
                    !isNaN(index)
                    && root !== cleanRoot
                    && String(index) === cleanRoot
                    && index >= 0
                    && (options.parseArrays && index <= options.arrayLimit)
                ) {
                    obj = [];
                    obj[index] = leaf;
                } else {
                    obj[cleanRoot] = leaf;
                }
            }

            leaf = obj;
        }

        return leaf;
    };

    const parseKeys = function parseQueryStringKeys(givenKey, val, options) {
        if (!givenKey) {
            return;
        }

        // Transform dot notation to bracket notation
        const key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

        // The regex chunks
        const brackets = /(\[[^[\]]*])/;
        const child = /(\[[^[\]]*])/g;

        // Get the parent
        let segment = brackets.exec(key);
        const parent = segment ? key.slice(0, segment.index) : key;

        // Stash the parent if it exists
        const keys = [];

        if (parent) {
            // If we aren't using plain objects, optionally prefix keys
            // that would overwrite object prototype properties
            if (!options.plainObjects && has$1.call(Object.prototype, parent)) {
                if (!options.allowPrototypes) {
                    return;
                }
            }

            keys.push(parent);
        }

        // Loop through children appending to the array until we hit depth
        let i = 0;

        while ((segment = child.exec(key)) !== null && i < options.depth) {
            i += 1;
            if (!options.plainObjects && has$1.call(Object.prototype, segment[1].slice(1, -1))) {
                if (!options.allowPrototypes) {
                    return;
                }
            }
            keys.push(segment[1]);
        }

        // If there's a remainder, just add whatever is left
        if (segment) {
            keys.push('[' + key.slice(segment.index) + ']');
        }

        return parseObject(keys, val, options);
    };

    function parse(str, opts) {
        const options = opts ? assign({}, opts) : {};

        if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
            throw new TypeError('Decoder has to be a function.');
        }

        options.ignoreQueryPrefix = options.ignoreQueryPrefix === true;
        options.delimiter = typeof options.delimiter === 'string' || isRegExp(options.delimiter) ? options.delimiter : defaults.delimiter;
        options.depth = typeof options.depth === 'number' ? options.depth : defaults.depth;
        options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults.arrayLimit;
        options.parseArrays = options.parseArrays !== false;
        options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults.decoder;
        options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults.allowDots;
        options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults.plainObjects;
        options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults.allowPrototypes;
        options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults.parameterLimit;
        options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;

        if (str === '' || str === null || typeof str === 'undefined') {
            return options.plainObjects ? Object.create(null) : {};
        }

        const tempObj = typeof str === 'string' ? parseValues(str, options) : str;
        let obj = options.plainObjects ? Object.create(null) : {};

        // Iterate over the keys and setup the new object

        const keys = Object.keys(tempObj);
        for (let i = 0; i < keys.length; ++i) {
            const key = keys[i];
            const newObj = parseKeys(key, tempObj[key], options);
            obj = merge(obj, newObj, options);
        }

        return compact(obj);
    }

    const arrayPrefixGenerators = {
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

    const toISO = Date.prototype.toISOString;

    const defaults$1 = {
        delimiter: '&',
        encode: true,
        encoder: encode,
        encodeValuesOnly: false,
        serializeDate: function serializeDate(date) { // eslint-disable-line func-name-matching
            return toISO.call(date);
        },
        skipNulls: false,
        strictNullHandling: false
    };

    const stringify = function stringify( // eslint-disable-line func-name-matching
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
        let obj = object;
        if (typeof filter === 'function') {
            obj = filter(prefix, obj);
        } else if (obj instanceof Date) {
            obj = serializeDate(obj);
        } else if (obj === null) {
            if (strictNullHandling) {
                return encoder && !encodeValuesOnly ? encoder(prefix, defaults$1.encoder, charset) : prefix;
            }

            obj = '';
        }

        if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || isBuffer(obj)) {
            if (encoder) {
                const keyValue = encodeValuesOnly ? prefix : encoder(prefix, defaults$1.encoder, charset);
                return [formatter(keyValue) + '=' + formatter(encoder(obj, defaults$1.encoder, charset))];
            }
            return [formatter(prefix) + '=' + formatter(String(obj))];
        }

        let values = [];

        if (typeof obj === 'undefined') {
            return values;
        }

        let objKeys;
        if (Array.isArray(filter)) {
            objKeys = filter;
        } else {
            const keys = Object.keys(obj);
            objKeys = sort ? keys.sort(sort) : keys;
        }

        for (let i = 0; i < objKeys.length; ++i) {
            const key = objKeys[i];

            if (skipNulls && obj[key] === null) {
                continue;
            }

            if (Array.isArray(obj)) {
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

    function stringify$1 (object, opts) {
        let obj = object;
        const options = opts ? assign({}, opts) : {};

        if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
            throw new TypeError('Encoder has to be a function.');
        }

        const delimiter = typeof options.delimiter === 'undefined' ? defaults$1.delimiter : options.delimiter;
        const strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults$1.strictNullHandling;
        const skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults$1.skipNulls;
        const encode$$1 = typeof options.encode === 'boolean' ? options.encode : defaults$1.encode;
        const encoder = typeof options.encoder === 'function' ? options.encoder : defaults$1.encoder;
        const sort = typeof options.sort === 'function' ? options.sort : null;
        const allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
        const serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults$1.serializeDate;
        const encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults$1.encodeValuesOnly;
        const charset = options.charset || 'utf-8';
        if (charset !== undefined && charset !== 'utf-8' && charset !== 'iso-8859-1') {
            throw new Error('The charset option must be either utf-8, iso-8859-1, or undefined');
        }

        if (typeof options.format === 'undefined') {
            options.format = RFC3986;
        } else if (!Object.prototype.hasOwnProperty.call(formatters, options.format)) {
            throw new TypeError('Unknown format option provided.');
        }
        const formatter = formatters[options.format];
        let objKeys;
        let filter;

        if (typeof options.filter === 'function') {
            filter = options.filter;
            obj = filter('', obj);
        } else if (Array.isArray(options.filter)) {
            filter = options.filter;
            objKeys = filter;
        }

        let keys = [];

        if (typeof obj !== 'object' || obj === null) {
            return '';
        }

        let arrayFormat;
        if (options.arrayFormat in arrayPrefixGenerators) {
            arrayFormat = options.arrayFormat;
        } else if ('indices' in options) {
            arrayFormat = options.indices ? 'indices' : 'repeat';
        } else {
            arrayFormat = 'indices';
        }

        const generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

        if (!objKeys) {
            objKeys = Object.keys(obj);
        }

        if (sort) {
            objKeys.sort(sort);
        }

        for (let i = 0; i < objKeys.length; ++i) {
            const key = objKeys[i];

            if (skipNulls && obj[key] === null) {
                continue;
            }

            keys = keys.concat(stringify(
                obj[key],
                key,
                generateArrayPrefix,
                strictNullHandling,
                skipNulls,
                encode$$1 ? encoder : null,
                filter,
                sort,
                allowDots,
                serializeDate,
                formatter,
                encodeValuesOnly,
                charset
            ));
        }

        const joined = keys.join(delimiter);
        let prefix = options.addQueryPrefix === true ? '?' : '';

        if (options.charsetSentinel) {
            if (charset === 'iso-8859-1') {
                // encodeURIComponent('&#10003;'), the "numeric entity" representation of a checkmark
                prefix += 'utf8=%26%2310003%3B&';
            } else {
                // encodeURIComponent('ÃÂ¢ÃÂÃÂ')
                prefix += 'utf8=%E2%9C%93&';
            }
        }

        return joined.length > 0 ? prefix + joined : '';
    }

    exports.formats = formats;
    exports.parse = parse;
    exports.stringify = stringify$1;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
