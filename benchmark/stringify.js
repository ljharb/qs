'use strict';

var BenchmarkRunner = require('./runner');
var fixtures = require('./fixtures');
var qs = require('../lib');

// Ensure polyfills are loaded
require('./polyfills');

function runStringifyBenchmarks(callback) {
    console.log('🔗 Running Stringify Benchmarks...\n');

    var runner = new BenchmarkRunner({
        verbose: true,
        outputDir: './benchmark/results'
    });

    // Simple object stringifying
    runner
        .add('Stringify simple object', function() {
            qs.stringify(fixtures.testObjects.simple);
        })
        .add('Stringify nested object', function() {
            qs.stringify(fixtures.testObjects.nested);
        })
        .add('Stringify arrays', function() {
            qs.stringify(fixtures.testObjects.arrays);
        })
        .add('Stringify mixed object', function() {
            qs.stringify(fixtures.testObjects.mixed);
        })
        .add('Stringify large object', function() {
            qs.stringify(fixtures.testObjects.large);
        });

    // Different array formats
    runner
        .add('Stringify array indices format', function() {
            qs.stringify(fixtures.testObjects.arrays, { arrayFormat: 'indices' });
        })
        .add('Stringify array brackets format', function() {
            qs.stringify(fixtures.testObjects.arrays, { arrayFormat: 'brackets' });
        })
        .add('Stringify array repeat format', function() {
            qs.stringify(fixtures.testObjects.arrays, { arrayFormat: 'repeat' });
        })
        .add('Stringify array comma format', function() {
            qs.stringify(fixtures.testObjects.arrays, { arrayFormat: 'comma' });
        });

    // Different options
    runner
        .add('Stringify with allowDots', function() {
            qs.stringify(fixtures.testObjects.nested, { allowDots: true });
        })
        .add('Stringify without encoding', function() {
            qs.stringify(fixtures.testObjects.mixed, { encode: false });
        })
        .add('Stringify with query prefix', function() {
            qs.stringify(fixtures.testObjects.simple, { addQueryPrefix: true });
        })
        .add('Stringify with custom delimiter', function() {
            qs.stringify(fixtures.testObjects.simple, { delimiter: ';' });
        });

    // Edge cases
    var edgeObjects = {
        nullValues: { a: null, b: '', c: 'value' },
        undefinedValues: { a: undefined, b: 'value', c: null },
        emptyArrays: { arr: [], obj: {}, value: 'test' },
        specialChars: { special: '!@#$%^&*()', unicode: '✓' }
    };

    runner
        .add('Stringify null values', function() {
            qs.stringify(edgeObjects.nullValues);
        })
        .add('Stringify with strictNullHandling', function() {
            qs.stringify(edgeObjects.nullValues, { strictNullHandling: true });
        })
        .add('Stringify with skipNulls', function() {
            qs.stringify(edgeObjects.nullValues, { skipNulls: true });
        })
        .add('Stringify special characters', function() {
            qs.stringify(edgeObjects.specialChars);
        });

    runner.run(callback);
}

if (require.main === module) {
    runStringifyBenchmarks(function(err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });
}

module.exports = runStringifyBenchmarks;

