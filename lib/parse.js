var Utils = require('./utils');
var internals = {};

internals.parseValues = function (str) {

    var obj = {};
    var parts = str.split('&');

    parts.forEach(function (part) {

        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        if (pos === -1) {
            obj[Utils.decode(part)] = '';
        }
        else {
            var key = Utils.decode(part.slice(0, pos));
            var val = Utils.decode(part.slice(pos + 1));

            if (!obj[key]) {
                obj[key] = val;
            }
            else {
                obj[key] = [].concat([obj[key], val]);
            }
        }
    });

    return obj;
};

internals.parseObject = function (chain, val) {

    if (!chain.length) {
        return val;
    }

    var root = chain.shift();
    var obj = {};

    var cleanRoot = root[0] === '[' && root[root.length - 1] === ']' ? root.slice(1, root.length - 1) : root;

    var index = parseInt(cleanRoot, 10);

    if (root === '[]') {
        obj = [];
        obj = obj.concat(internals.parseObject(chain, val));
    }
    else if (!isNaN(index) && root !== cleanRoot) {
        obj = [];
        obj[index] = internals.parseObject(chain, val);
    }
    else {
        obj[cleanRoot] = internals.parseObject(chain, val);
    }

    return obj;
};

internals.parseKeys = function (key, val, depth) {

    if (!key) {
        return;
    }

    depth = typeof depth === 'undefined' ? 5 : depth; // default to 5

    var keys = [];

    // the regex chunks
    var parent = /^([^\[\]]*)/;
    var child = /(\[[^\[\]]*\])/g;

    // get the parent
    var segment = parent.exec(key);

    // don't allow them to overwrite object prototype properties
    if (Object.prototype.hasOwnProperty(segment[1])) {
        return;
    }

    // stash the parent
    keys.push(segment[1]);

    // loop through children appending to the array until we hit depth
    var i = 0;
    while ((segment = child.exec(key)) !== null && i < depth) {

        i += 1;
        if (!Object.prototype.hasOwnProperty(segment[1].replace(/\[|\]/g, ''))) {
            keys.push(segment[1]);
        }
    }

    // if there's a remainder, just add whatever's left
    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return internals.parseObject(keys, val);
};

module.exports = function (str, depth) {

    // use node's native querystring module to do the initial parse
    // this takes care of things like url decoding, as well as the splitting
    if (str === '' || str === null || typeof str === 'undefined') {
        return {};
    }

    var tempObj = typeof str === 'string' ? internals.parseValues(str) : Utils.clone(str);
    var obj = {};

    // iterate over the keys and setup the new object
    Object.keys(tempObj).forEach(function (key) {

        var newObj = internals.parseKeys(key, tempObj[key], depth);
        obj = Utils.merge(obj, newObj);
    });

    return Utils.compact(obj);
};


