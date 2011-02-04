
/*!
 * querystring
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Library version.
 */

exports.version = '0.0.1';

/**
 * Parse the given query `str`, returning an object.
 *
 * @param {String} str
 * @return {Object}
 * @api public
 */

exports.parse = function(str) {
  return String(str)
    .split('&')
    .reduce(function(ret, pair){
      var parts = decodeURIComponent(pair).split('=')
        , obj = ret
        , key = parts.shift()
        , val = parts.join('=');

      // nested
      if (~key.indexOf(']')) {
        var parts = key.split('[')
          , len = parts.length
          , last = len - 1;

        function parse(obj, parts, parent, key) {
          var part = parts.shift();

          // end
          if (!part) {
            parent[key] = val;
          // array
          } else if (']' == part) {
            obj = parent[key] = Array.isArray(parent[key])
              ? parent[key]
              : [];
            if ('' != val) obj.push(val);
          // prop
          } else if (~part.indexOf(']')) {
            part = part.substr(0, part.length - 1);
            parse(obj[part] = obj[part] || {}, parts, obj, part);
          // key
          } else {
            parse(obj[part] = obj[part] || {}, parts, obj, part);
          }
        }

        parse(obj, parts);
      // optimize
      } else {
        obj[key] = val;
      }

      return ret;
    }, {});
};