'use strict';

var utils = require('./utils');

var has = Object.prototype.hasOwnProperty;
var isArray = Array.isArray;

var defaults = {
    allowDots: false,
    allowEmptyArrays: false,
    allowPrototypes: false,
    allowSparse: false,
    arrayLimit: 20,
    charset: 'utf-8',
    charsetSentinel: false,
    comma: false,
    decodeDotInKeys: false,
    decoder: utils.decode,
    delimiter: '&',
    depth: 5,
    duplicates: 'combine',
    ignoreQueryPrefix: false,
    interpretNumericEntities: false,
    parameterLimit: 1000,
    parseArrays: true,
    plainObjects: false,
    strictDepth: false,
    strictMerge: true,
    strictNullHandling: false,
    throwOnLimitExceeded: false
};

var interpretNumericEntities = function (str) {
    return str.replace(/&#(\d+);/g, function ($0, numberStr) {
        return String.fromCharCode(parseInt(numberStr, 10));
    });
};

var parseArrayValue = function (val, options, currentArrayLength) {
    if (val && typeof val === 'string' && options.comma && val.indexOf(',') > -1) {
        return val.split(',');
    }

    if (options.throwOnLimitExceeded && currentArrayLength >= options.arrayLimit) {
        throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
    }

    return val;
};

// This is what browsers will submit when the ✓ character occurs in an
// application/x-www-form-urlencoded body and the encoding of the page containing
// the form is iso-8859-1, or when the submitted form has an accept-charset
// attribute of iso-8859-1. Presumably also with other charsets that do not contain
// the ✓ character, such as us-ascii.
var isoSentinel = 'utf8=%26%2310003%3B'; // encodeURIComponent('&#10003;')

// These are the percent-encoded utf-8 octets representing a checkmark, indicating that the request actually is utf-8 encoded.
var charsetSentinel = 'utf8=%E2%9C%93'; // encodeURIComponent('✓')

var parseValues = function parseQueryStringValues(str, options) {
    var obj = { __proto__: null };

    var cleanStr = options.ignoreQueryPrefix && str.charCodeAt(0) === 0x3F ? str.slice(1) : str;
    if (cleanStr.indexOf('%5') !== -1) {
        cleanStr = cleanStr.replace(/%5B/gi, '[').replace(/%5D/gi, ']');
    }

    var limit = options.parameterLimit === Infinity ? void undefined : options.parameterLimit;
    var parts;
    var delimiter = options.delimiter;
    if (typeof delimiter === 'string' && delimiter.length === 1) {
        parts = [];
        var splitLimit = typeof limit === 'undefined' ? Infinity : options.throwOnLimitExceeded ? limit + 1 : limit;
        var start = 0;
        var idx = cleanStr.indexOf(delimiter);
        while (idx !== -1 && parts.length < splitLimit) {
            parts[parts.length] = cleanStr.slice(start, idx);
            start = idx + 1;
            idx = cleanStr.indexOf(delimiter, start);
        }
        if (parts.length < splitLimit) {
            parts[parts.length] = cleanStr.slice(start);
        }
    } else {
        parts = cleanStr.split(
            delimiter,
            options.throwOnLimitExceeded && typeof limit !== 'undefined' ? limit + 1 : limit
        );
    }

    if (options.throwOnLimitExceeded && typeof limit !== 'undefined' && parts.length > limit) {
        throw new RangeError('Parameter limit exceeded. Only ' + limit + ' parameter' + (limit === 1 ? '' : 's') + ' allowed.');
    }

    var skipIndex = -1; // Keep track of where the utf8 sentinel was found
    var i;

    var charset = options.charset;
    if (options.charsetSentinel) {
        for (i = 0; i < parts.length; ++i) {
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

    var decoder = options.decoder;
    var defaultDecoder = defaults.decoder;
    var isDefaultDecoder = decoder === defaultDecoder;
    var decodeValue = function (encodedVal) {
        return decoder(encodedVal, defaultDecoder, charset, 'value');
    };

    for (i = 0; i < parts.length; ++i) {
        if (i === skipIndex) {
            continue;
        }
        var part = parts[i];

        var bracketEqualsPos = part.indexOf(']=');
        var pos = bracketEqualsPos === -1 ? part.indexOf('=') : bracketEqualsPos + 1;
        var partNeedsDecoding = !isDefaultDecoder || part.indexOf('%') !== -1 || part.indexOf('+') !== -1;

        var key;
        var val;
        if (pos === -1) {
            key = partNeedsDecoding ? decoder(part, defaultDecoder, charset, 'key') : part;
            val = options.strictNullHandling ? null : '';
        } else if (partNeedsDecoding) {
            key = decoder(part.slice(0, pos), defaultDecoder, charset, 'key');

            if (key !== null) {
                val = utils.maybeMap(
                    parseArrayValue(
                        part.slice(pos + 1),
                        options,
                        isArray(obj[key]) ? obj[key].length : 0
                    ),
                    decodeValue
                );
            }
        } else {
            key = part.slice(0, pos);
            val = parseArrayValue(part.slice(pos + 1), options, isArray(obj[key]) ? obj[key].length : 0);
        }

        if (val && options.interpretNumericEntities && charset === 'iso-8859-1') {
            val = interpretNumericEntities(String(val));
        }

        if (part.indexOf('[]=') > -1) {
            val = isArray(val) ? [val] : val;
        }

        if (options.comma && isArray(val) && val.length > options.arrayLimit) {
            if (options.throwOnLimitExceeded) {
                throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
            }
            val = utils.combine([], val, options.arrayLimit, options.plainObjects);
        }

        if (key !== null) {
            var existing = has.call(obj, key);
            if (existing && (options.duplicates === 'combine' || part.indexOf('[]=') > -1)) {
                obj[key] = utils.combine(
                    obj[key],
                    val,
                    options.arrayLimit,
                    options.plainObjects
                );
            } else if (!existing || options.duplicates === 'last') {
                obj[key] = val;
            }
        }
    }

    return obj;
};

var parseObject = function (chain, val, options, valuesParsed) {
    var currentArrayLength = 0;
    if (chain.length > 0 && chain[chain.length - 1] === '[]') {
        var parentKey = chain.slice(0, -1).join('');
        currentArrayLength = Array.isArray(val) && val[parentKey] ? val[parentKey].length : 0;
    }

    var leaf = valuesParsed ? val : parseArrayValue(val, options, currentArrayLength);

    for (var i = chain.length - 1; i >= 0; --i) {
        var obj;
        var root = chain[i];

        if (root === '[]' && options.parseArrays) {
            if (utils.isOverflow(leaf)) {
                // leaf is already an overflow object, preserve it
                obj = leaf;
            } else {
                obj = options.allowEmptyArrays && (leaf === '' || (options.strictNullHandling && leaf === null))
                    ? []
                    : utils.combine(
                        [],
                        leaf,
                        options.arrayLimit,
                        options.plainObjects
                    );
            }
        } else {
            obj = options.plainObjects ? { __proto__: null } : {};
            var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
            var decodedRoot = options.decodeDotInKeys ? cleanRoot.replace(/%2E/g, '.') : cleanRoot;
            var index = parseInt(decodedRoot, 10);
            var isValidArrayIndex = !isNaN(index)
                && root !== decodedRoot
                && String(index) === decodedRoot
                && index >= 0
                && options.parseArrays;
            if (!options.parseArrays && decodedRoot === '') {
                obj = { 0: leaf };
            } else if (isValidArrayIndex && index < options.arrayLimit) {
                obj = [];
                obj[index] = leaf;
            } else if (isValidArrayIndex && options.throwOnLimitExceeded) {
                throw new RangeError('Array limit exceeded. Only ' + options.arrayLimit + ' element' + (options.arrayLimit === 1 ? '' : 's') + ' allowed in an array.');
            } else if (isValidArrayIndex) {
                obj[index] = leaf;
                utils.markOverflow(obj, index);
            } else if (decodedRoot !== '__proto__') {
                obj[decodedRoot] = leaf;
            }
        }

        leaf = obj;
    }

    return leaf;
};

var splitKeyIntoSegments = function splitKeyIntoSegments(givenKey, options) {
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    if (options.depth <= 0) {
        if (!options.plainObjects && has.call(Object.prototype, key)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        return [key];
    }

    if (key.indexOf('[') === -1) {
        if (!options.plainObjects && has.call(Object.prototype, key)) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        return [key];
    }

    var firstOpen = key.indexOf('[');
    var parent = firstOpen > 0 ? key.slice(0, firstOpen) : '';

    var keys = [];

    if (parent) {
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys[keys.length] = parent;
    }

    var i = 0;
    var pos = firstOpen;
    while (pos !== -1 && i < options.depth) {
        var close = key.indexOf(']', pos);
        if (close === -1) {
            keys[keys.length] = '[' + key.slice(pos) + ']';
            pos = -1;
        } else {
            var seg = key.slice(pos, close + 1);
            var segmentContent = key.slice(pos + 1, close);
            if (!options.plainObjects && has.call(Object.prototype, segmentContent)) {
                if (!options.allowPrototypes) {
                    return;
                }
            }

            keys[keys.length] = seg;
            i += 1;
            pos = key.indexOf('[', close + 1);
        }
    }

    if (pos !== -1) {
        if (options.strictDepth === true) {
            throw new RangeError('Input depth exceeded depth option of ' + options.depth + ' and strictDepth is true');
        }

        keys[keys.length] = '[' + key.slice(pos) + ']';
    }

    return keys;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options, valuesParsed) {
    if (!givenKey) {
        return;
    }

    var keys = splitKeyIntoSegments(givenKey, options);

    if (!keys) {
        return;
    }

    return parseObject(keys, val, options, valuesParsed);
};

var normalizeParseOptions = function normalizeParseOptions(opts) {
    if (!opts) {
        return defaults;
    }

    if (typeof opts.allowEmptyArrays !== 'undefined' && typeof opts.allowEmptyArrays !== 'boolean') {
        throw new TypeError('`allowEmptyArrays` option can only be `true` or `false`, when provided');
    }

    if (typeof opts.decodeDotInKeys !== 'undefined' && typeof opts.decodeDotInKeys !== 'boolean') {
        throw new TypeError('`decodeDotInKeys` option can only be `true` or `false`, when provided');
    }

    if (opts.decoder !== null && typeof opts.decoder !== 'undefined' && typeof opts.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    if (typeof opts.charset !== 'undefined' && opts.charset !== 'utf-8' && opts.charset !== 'iso-8859-1') {
        throw new TypeError('The charset option must be either utf-8, iso-8859-1, or undefined');
    }

    if (typeof opts.throwOnLimitExceeded !== 'undefined' && typeof opts.throwOnLimitExceeded !== 'boolean') {
        throw new TypeError('`throwOnLimitExceeded` option must be a boolean');
    }

    var charset = typeof opts.charset === 'undefined' ? defaults.charset : opts.charset;

    var duplicates = typeof opts.duplicates === 'undefined' ? defaults.duplicates : opts.duplicates;

    if (duplicates !== 'combine' && duplicates !== 'first' && duplicates !== 'last') {
        throw new TypeError('The duplicates option must be either combine, first, or last');
    }

    var allowDots = typeof opts.allowDots === 'undefined' ? opts.decodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;

    return {
        allowDots: allowDots,
        allowEmptyArrays: typeof opts.allowEmptyArrays === 'boolean' ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
        allowPrototypes: typeof opts.allowPrototypes === 'boolean' ? opts.allowPrototypes : defaults.allowPrototypes,
        allowSparse: typeof opts.allowSparse === 'boolean' ? opts.allowSparse : defaults.allowSparse,
        arrayLimit: typeof opts.arrayLimit === 'number' ? opts.arrayLimit : defaults.arrayLimit,
        charset: charset,
        charsetSentinel: typeof opts.charsetSentinel === 'boolean' ? opts.charsetSentinel : defaults.charsetSentinel,
        comma: typeof opts.comma === 'boolean' ? opts.comma : defaults.comma,
        decodeDotInKeys: typeof opts.decodeDotInKeys === 'boolean' ? opts.decodeDotInKeys : defaults.decodeDotInKeys,
        decoder: typeof opts.decoder === 'function' ? opts.decoder : defaults.decoder,
        delimiter: typeof opts.delimiter === 'string' || utils.isRegExp(opts.delimiter) ? opts.delimiter : defaults.delimiter,
        // eslint-disable-next-line no-implicit-coercion, no-extra-parens
        depth: (typeof opts.depth === 'number' || opts.depth === false) ? +opts.depth : defaults.depth,
        duplicates: duplicates,
        ignoreQueryPrefix: opts.ignoreQueryPrefix === true,
        interpretNumericEntities: typeof opts.interpretNumericEntities === 'boolean' ? opts.interpretNumericEntities : defaults.interpretNumericEntities,
        parameterLimit: typeof opts.parameterLimit === 'number' ? opts.parameterLimit : defaults.parameterLimit,
        parseArrays: opts.parseArrays !== false,
        plainObjects: typeof opts.plainObjects === 'boolean' ? opts.plainObjects : defaults.plainObjects,
        strictDepth: typeof opts.strictDepth === 'boolean' ? !!opts.strictDepth : defaults.strictDepth,
        strictMerge: typeof opts.strictMerge === 'boolean' ? !!opts.strictMerge : defaults.strictMerge,
        strictNullHandling: typeof opts.strictNullHandling === 'boolean' ? opts.strictNullHandling : defaults.strictNullHandling,
        throwOnLimitExceeded: typeof opts.throwOnLimitExceeded === 'boolean' ? opts.throwOnLimitExceeded : false
    };
};

module.exports = function (str, opts) {
    var options = normalizeParseOptions(opts);

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? { __proto__: null } : {};
    }

    var isStr = typeof str === 'string';
    var tempObj = isStr ? parseValues(str, options) : str;
    var obj = options.plainObjects ? { __proto__: null } : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    var needsCompact = false;
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        if (key && isStr && key.indexOf('[') === -1 && (!options.allowDots || key.indexOf('.') === -1)) {
            if (!options.plainObjects && has.call(Object.prototype, key)) {
                if (!options.allowPrototypes) {
                    continue;
                }
            }
            if (has.call(obj, key)) {
                obj[key] = utils.merge(obj[key], tempObj[key], options);
            } else {
                obj[key] = tempObj[key];
            }
        } else {
            var newObj = parseKeys(key, tempObj[key], options, isStr);
            obj = utils.merge(obj, newObj, options);
            needsCompact = true;
        }
    }

    if (options.allowSparse === true || !needsCompact) {
        return obj;
    }

    return utils.compact(obj);
};
