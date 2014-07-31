var internals = {};

internals.stringify = function (obj, prefix) {

    if (typeof obj === 'string' || typeof obj === 'number') {
        return [prefix + '=' + encodeURIComponent(obj)];
    }

    if (obj === null) {
        return [prefix];
    }

    var values = [];

    Object.keys(obj).forEach(function (key) {

        values = values.concat(internals.stringify(obj[key], prefix + '[' + encodeURIComponent(key) + ']'));
    });

    return values;
};

module.exports = function (obj) {

    var keys = [];
    var value = JSON.parse(JSON.stringify(obj));

    Object.keys(value).forEach(function (key) {

        keys = keys.concat(internals.stringify(value[key], encodeURIComponent(key)));
    });

    return keys.join('&');
};
