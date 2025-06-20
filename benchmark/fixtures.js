'use strict';

/**
 * Generates various test data patterns for benchmarking
 */

// Simple flat query strings
const simpleQueries = {
    tiny: 'a=1&b=2&c=3',
    small: 'name=John&age=30&city=NYC&country=USA&email=john@example.com',
    medium: Array.from({length: 20}, (_, i) => `param${i}=value${i}`).join('&'),
    large: Array.from({length: 100}, (_, i) => `param${i}=value${i}`).join('&'),
    xlarge: Array.from({length: 500}, (_, i) => `param${i}=value${i}`).join('&')
};

// Nested object queries
const nestedQueries = {
    shallow: 'user[name]=John&user[age]=30&user[email]=john@example.com',
    medium: 'user[profile][name]=John&user[profile][bio]=Developer&user[settings][theme]=dark',
    deep: 'user[profile][personal][name][first]=John&user[profile][personal][name][last]=Doe&user[profile][personal][address][street]=123 Main St&user[profile][personal][address][city]=NYC',
    veryDeep: 'a[b][c][d][e][f][g][h][i][j]=deep'
};

// Array queries
const arrayQueries = {
    simple: 'colors[]=red&colors[]=green&colors[]=blue',
    indexed: 'items[0]=first&items[1]=second&items[2]=third&items[3]=fourth&items[4]=fifth',
    sparse: 'sparse[1]=second&sparse[5]=sixth&sparse[10]=tenth',
    mixed: 'user[name]=John&user[hobbies][]=reading&user[hobbies][]=coding&user[addresses][0][street]=123 Main&user[addresses][0][city]=NYC',
    large: Array.from({length: 50}, (_, i) => `items[]=${i}`).join('&')
};

// Edge case queries
const edgeCaseQueries = {
    emptyValues: 'a=&b=&c=value&d=',
    specialChars: 'special=%21%40%23%24%25%5E%26%2A%28%29&unicode=%E2%9C%93',
    longValues: `long=${'x'.repeat(1000)}&short=y`,
    manyParams: Array.from({length: 200}, (_, i) => `p${i}=v${i}`).join('&'),
    deepNesting: Array.from({length: 10}, (_, i) => `level${i}`).reduce((acc, level) => `${acc}[${level}]`, 'deep') + '=value'
};

// Mixed complexity queries (realistic scenarios)
const realWorldQueries = {
    ecommerce: 'category=electronics&subcategory=phones&brand[]=apple&brand[]=samsung&price[min]=100&price[max]=1000&features[]=camera&features[]=5g&sort=price&order=asc&page=2&limit=20',
    form: 'user[name]=John%20Doe&user[email]=john%40example.com&user[age]=30&preferences[newsletter]=true&preferences[theme]=dark&address[street]=123%20Main%20St&address[city]=New%20York&address[zip]=10001',
    analytics: 'event=pageview&timestamp=1640995200&user[id]=12345&user[session]=abc123&page[url]=/products/123&page[title]=Product%20Details&utm[source]=google&utm[medium]=cpc&utm[campaign]=summer_sale',
    api: 'fields[]=id&fields[]=name&fields[]=email&include[]=profile&include[]=settings&filter[status]=active&filter[created_after]=2023-01-01&sort[]=name&sort[]=-created_at&page[number]=1&page[size]=25'
};

// Performance stress tests
const stressTestQueries = {
    manyKeys: Array.from({length: 1000}, (_, i) => `key${i}=value${i}`).join('&'),
    deepNesting: 'a' + '[level]'.repeat(20) + '=deep',
    largeArrays: Array.from({length: 100}, (_, i) => `items[]=${i}`).join('&'),
    mixedComplexity: [
        ...Array.from({length: 50}, (_, i) => `simple${i}=value${i}`),
        ...Array.from({length: 20}, (_, i) => `nested[${i}][prop]=value${i}`),
        ...Array.from({length: 30}, (_, i) => `array[]=${i}`)
    ].join('&')
};

// Generate test objects for stringify benchmarks
const testObjects = {
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
    },
    large: Object.fromEntries(
        Array.from({length: 100}, (_, i) => [`key${i}`, `value${i}`])
    )
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
        
        return queries[type]?.[size] || simpleQueries.medium;
    },
    
    generateObject: (type) => {
        return testObjects[type] || testObjects.simple;
    }
};

