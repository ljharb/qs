// Load modules


// Declare internals

var internals = {};


exports.arrayToObject = function (source) {

    var obj = {};
    for (var i = 0, il = source.length; i < il; ++i) {
        if (source[i] !== undefined &&
            source[i] !== null) {

            obj[i] = source[i];
        }
    }

    return obj;
};


exports.clone = function (source) {

    if (typeof source !== 'object' ||
        source === null) {

        return source;
    }

    if (Buffer.isBuffer(source)) {
        return source.toString();
    }

    var obj = Array.isArray(source) ? [] : {};
    objectForEach(source, function(key, value){
        obj[key] = exports.clone(value);
    })

    return obj;
};


exports.merge = function (target, source) {

    if (!source) {
        return target;
    }

    var obj = exports.clone(target);

    if (Array.isArray(source)) {
        for (var i = 0, il = source.length; i < il; ++i) {
            if (source[i] !== undefined) {
                obj[i] = source[i];
            }
        }

        return obj;
    }

    if (Array.isArray(obj)) {
        obj = exports.arrayToObject(obj);
    }

    var keys = Object.keys(source);
    for (var k = 0, kl = keys.length; k < kl; ++k) {
        var key = keys[k];
        var value = source[key];

        if (value &&
            typeof value === 'object') {

            if (!obj[key]) {
                obj[key] = exports.clone(value);
            }
            else {
                obj[key] = exports.merge(obj[key], value);
            }
        }
        else {
            obj[key] = value;
        }
    }

    return obj;
};


exports.decode = function (str) {

    try {
        return decodeURIComponent(str.replace(/\+/g, ' '));
    } catch (e) {
        return str;
    }
};


exports.compact = function (obj) {
    if (typeof obj !== 'object') {
        return obj;
    }

    var compacted = {};

    objectForEach(obj, function(key, value) {
        if (Array.isArray(value)) {
            compacted[key] = compactArray(value);
        }
        else {
            compacted[key] = exports.compact(value);
        }
    })

    return compacted;
};

function compactArray(arr) {
    var compacted = [];
    arr.forEach(function(e) {
        compacted.push(e);
    })
    return compacted;
}

function objectForEach(obj, fn) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            fn(key, obj[key]);
        }
    }
}
