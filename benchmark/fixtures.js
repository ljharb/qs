'use strict';

/**
 * Generates various test data patterns for benchmarking
 */

// Load polyfills for older Node.js versions
require('./polyfills');

// Helper function to replace Array.from for older Node.js
function generateArray(length, mapFn) {
    var arr = new Array(length);
    for (var i = 0; i < length; i++) {
        arr[i] = mapFn(null, i);
    }
    return arr;
}

// Helper function for repeating strings
function repeatString(str, count) {
    if (typeof String.prototype.repeat === 'function') {
        return str.repeat(count);
    }

    var result = '';
    while (count > 0) {
        result += str;
        count--;
    }
    return result;
}

// Simple flat query strings
var simpleQueries = {
    tiny: 'a=1&b=2&c=3',
    small: 'name=John&age=30&city=NYC&country=USA&email=john@example.com'
};

// Generate medium and large query strings using a loop
simpleQueries.medium = '';
for (var i = 0; i < 20; i++) {
    if (i > 0) simpleQueries.medium += '&';
    simpleQueries.medium += 'param' + i + '=value' + i;
}

simpleQueries.large = '';
for (var i = 0; i < 100; i++) {
    if (i > 0) simpleQueries.large += '&';
    simpleQueries.large += 'param' + i + '=value' + i;
}

simpleQueries.xlarge = '';
for (var i = 0; i < 500; i++) {
    if (i > 0) simpleQueries.xlarge += '&';
    simpleQueries.xlarge += 'param' + i + '=value' + i;
}

// Nested object queries
var nestedQueries = {
    shallow: 'user[name]=John&user[age]=30&user[email]=john@example.com',
    medium: 'user[profile][name]=John&user[profile][bio]=Developer&user[settings][theme]=dark',
    deep: 'user[profile][personal][name][first]=John&user[profile][personal][name][last]=Doe&user[profile][personal][address][street]=123 Main St&user[profile][personal][address][city]=NYC',
    veryDeep: 'a[b][c][d][e][f][g][h][i][j]=deep'
};

// Array queries
var arrayQueries = {
    simple: 'colors[]=red&colors[]=green&colors[]=blue',
    indexed: 'items[0]=first&items[1]=second&items[2]=third&items[3]=fourth&items[4]=fifth',
    sparse: 'sparse[1]=second&sparse[5]=sixth&sparse[10]=tenth',
    mixed: 'user[name]=John&user[hobbies][]=reading&user[hobbies][]=coding&user[addresses][0][street]=123 Main&user[addresses][0][city]=NYC'
};

// Generate large array query string
arrayQueries.large = '';
for (var i = 0; i < 50; i++) {
    if (i > 0) arrayQueries.large += '&';
    arrayQueries.large += 'items[]=' + i;
}

// Edge case queries
var edgeCaseQueries = {
    emptyValues: 'a=&b=&c=value&d=',
    specialChars: 'special=%21%40%23%24%25%5E%26%2A%28%29&unicode=%E2%9C%93'
};

// Generate long values - repeat 'x' 1000 times
var xRepeated = repeatString('x', 1000);
edgeCaseQueries.longValues = 'long=' + xRepeated + '&short=y';

// Generate many params
edgeCaseQueries.manyParams = '';
for (var i = 0; i < 200; i++) {
    if (i > 0) edgeCaseQueries.manyParams += '&';
    edgeCaseQueries.manyParams += 'p' + i + '=v' + i;
}

// Generate deep nesting
edgeCaseQueries.deepNesting = 'deep';
for (var i = 0; i < 10; i++) {
    edgeCaseQueries.deepNesting += '[level' + i + ']';
}
edgeCaseQueries.deepNesting += '=value';

// Mixed complexity queries (realistic scenarios)
var realWorldQueries = {
    ecommerce: 'category=electronics&subcategory=phones&brand[]=apple&brand[]=samsung&price[min]=100&price[max]=1000&features[]=camera&features[]=5g&sort=price&order=asc&page=2&limit=20',
    form: 'user[name]=John%20Doe&user[email]=john%40example.com&user[age]=30&preferences[newsletter]=true&preferences[theme]=dark&address[street]=123%20Main%20St&address[city]=New%20York&address[zip]=10001',
    analytics: 'event=pageview&timestamp=1640995200&user[id]=12345&user[session]=abc123&page[url]=/products/123&page[title]=Product%20Details&utm[source]=google&utm[medium]=cpc&utm[campaign]=summer_sale',
    api: 'fields[]=id&fields[]=name&fields[]=email&include[]=profile&include[]=settings&filter[status]=active&filter[created_after]=2023-01-01&sort[]=name&sort[]=-created_at&page[number]=1&page[size]=25'
};

// Performance stress tests
var stressTestQueries = {
    deepNesting: 'a' + repeatString('[level]', 20) + '=deep'
};

// Generate manyKeys
stressTestQueries.manyKeys = '';
for (var i = 0; i < 1000; i++) {
    if (i > 0) stressTestQueries.manyKeys += '&';
    stressTestQueries.manyKeys += 'key' + i + '=value' + i;
}

// Generate largeArrays
stressTestQueries.largeArrays = '';
for (var i = 0; i < 100; i++) {
    if (i > 0) stressTestQueries.largeArrays += '&';
    stressTestQueries.largeArrays += 'items[]=' + i;
}

// Generate mixedComplexity
stressTestQueries.mixedComplexity = '';
// Simple items
for (var i = 0; i < 50; i++) {
    if (i > 0) stressTestQueries.mixedComplexity += '&';
    stressTestQueries.mixedComplexity += 'simple' + i + '=value' + i;
}
// Nested items
for (var i = 0; i < 20; i++) {
    stressTestQueries.mixedComplexity += '&nested[' + i + '][prop]=value' + i;
}
// Array items
for (var i = 0; i < 30; i++) {
    stressTestQueries.mixedComplexity += '&array[]=' + i;
}

// Generate test objects for stringify benchmarks
var testObjects = {
    simple: { a: '1', b: '2', c: '3' },
    nested: {
        user: {
            name: 'John',
            profile: {
                age: 30,
                bio: 'Developer'
            }
        }
    },
    arrays: {
        colors: ['red', 'green', 'blue'],
        numbers: [1, 2, 3, 4, 5]
    },
    mixed: {
        name: 'John',
        hobbies: ['reading', 'coding'],
        address: {
            street: '123 Main St',
            city: 'NYC',
            coordinates: {
                lat: 40.7128,
                lng: -74.0060
            }
        },
        preferences: {
            theme: 'dark',
            notifications: {
                email: true,
                push: false
            }
        }
    }
};

// Generate large object without using Object.fromEntries
testObjects.large = {};
for (var i = 0; i < 100; i++) {
    testObjects.large['key' + i] = 'value' + i;
}

module.exports = {
    simpleQueries: simpleQueries,
    nestedQueries: nestedQueries,
    arrayQueries: arrayQueries,
    edgeCaseQueries: edgeCaseQueries,
    realWorldQueries: realWorldQueries,
    stressTestQueries: stressTestQueries,
    testObjects: testObjects,

    // Helper functions
    generateQuery: function(type, size) {
        size = size || 'medium';
        var queries = {
            simple: simpleQueries,
            nested: nestedQueries,
            array: arrayQueries,
            edge: edgeCaseQueries,
            real: realWorldQueries,
            stress: stressTestQueries
        };

        return queries[type] && queries[type][size] ? queries[type][size] : simpleQueries.medium;
    },

    generateObject: function(type) {
        return testObjects[type] || testObjects.simple;
    }
};

module.exports = {
    simpleQueries,
    nestedQueries,
    arrayQueries,
    edgeCaseQueries,
    realWorldQueries,
    stressTestQueries,
    testObjects,

    // Helper functions
    generateQuery: (type, size = 'medium') => {
        const queries = {
            simple: simpleQueries,
            nested: nestedQueries,
            array: arrayQueries,
            edge: edgeCaseQueries,
            real: realWorldQueries,
            stress: stressTestQueries
        };

        return (queries[type] && queries[type][size]) ? queries[type][size] : simpleQueries.medium;
    },

    generateObject: (type) => {
        return testObjects[type] || testObjects.simple;
    }
};

