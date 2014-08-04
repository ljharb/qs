// Load modules


// Declare internals

var internals = {};


internals.stringify = function (obj, prefix) {

    if (typeof obj === 'string' ||
        typeof obj === 'number') {

        return [prefix + '=' + encodeURIComponent(obj)];
    }

    if (obj === null) {
        return [prefix];
    }

    var values = [];

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            values = values.concat(internals.stringify(obj[key], prefix + '[' + encodeURIComponent(key) + ']'));
        }
    }

    return values;
};


module.exports = function (obj) {

    var keys = [];
    var value = JSON.parse(JSON.stringify(obj));

    for (var key in value) {
        if (value.hasOwnProperty(key)) {
            keys = keys.concat(internals.stringify(value[key], encodeURIComponent(key)));
        }
    }

    return keys.join('&');
};
