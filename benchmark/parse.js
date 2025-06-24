'use strict';

var BenchmarkRunner = require('./runner');
var fixtures = require('./fixtures');
var qs = require('../lib/index');

// Ensure polyfills are loaded
require('./polyfills');

function runParseBenchmarks(callback) {
    console.log('🔍 Running Parse Benchmarks...\n');

    var runner = new BenchmarkRunner({
        verbose: true,
        outputDir: './benchmark/results'
    });

    // Simple parsing benchmarks
    runner
        .add('Parse simple tiny query', function() {
            qs.parse(fixtures.simpleQueries.tiny);
        })
        .add('Parse simple small query', function() {
            qs.parse(fixtures.simpleQueries.small);
        })
        .add('Parse simple medium query', function() {
            qs.parse(fixtures.simpleQueries.medium);
        })
        .add('Parse simple large query', function() {
            qs.parse(fixtures.simpleQueries.large);
        });

    // Nested object parsing
    runner
        .add('Parse shallow nested', function() {
            qs.parse(fixtures.nestedQueries.shallow);
        })
        .add('Parse medium nested', function() {
            qs.parse(fixtures.nestedQueries.medium);
        })
        .add('Parse deep nested', function() {
            qs.parse(fixtures.nestedQueries.deep);
        });

    // Array parsing
    runner
        .add('Parse simple array', function() {
            qs.parse(fixtures.arrayQueries.simple);
        })
        .add('Parse indexed array', function() {
            qs.parse(fixtures.arrayQueries.indexed);
        })
        .add('Parse mixed array/object', function() {
            qs.parse(fixtures.arrayQueries.mixed);
        });

    // Real-world scenarios
    runner
        .add('Parse e-commerce query', function() {
            qs.parse(fixtures.realWorldQueries.ecommerce);
        })
        .add('Parse form data', function() {
            qs.parse(fixtures.realWorldQueries.form);
        })
        .add('Parse API query', function() {
            qs.parse(fixtures.realWorldQueries.api);
        });

    // Edge cases
    runner
        .add('Parse empty values', function() {
            qs.parse(fixtures.edgeCaseQueries.emptyValues);
        })
        .add('Parse special characters', function() {
            qs.parse(fixtures.edgeCaseQueries.specialChars);
        });

    // Options testing
    runner
        .add('Parse with allowDots', function() {
            qs.parse('user.name=John&user.age=30', { allowDots: true });
        })
        .add('Parse with comma arrays', function() {
            qs.parse('colors=red,green,blue', { comma: true });
        })
        .add('Parse with depth limit', function() {
            qs.parse(fixtures.nestedQueries.deep, { depth: 2 });
        });

    // Stress tests (comment out for regular benchmarks)
    if (process.env.STRESS_TEST) {
        runner
            .add('Parse many keys (stress)', function() {
                qs.parse(fixtures.stressTestQueries.manyKeys);
            })
            .add('Parse deep nesting (stress)', function() {
                qs.parse(fixtures.stressTestQueries.deepNesting);
            })
            .add('Parse large arrays (stress)', function() {
                qs.parse(fixtures.stressTestQueries.largeArrays);
            });
    }

    runner.run(callback);
}

if (require.main === module) {
    runParseBenchmarks(function(err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });
}

module.exports = runParseBenchmarks;

