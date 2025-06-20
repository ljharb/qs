'use strict';

const BenchmarkRunner = require('./runner');
const fixtures = require('./fixtures');
const qs = require('../lib/index');

async function runParseBenchmarks() {
    console.log('🔍 Running Parse Benchmarks...\n');
    
    const runner = new BenchmarkRunner({
        verbose: true,
        outputDir: './benchmark/results'
    });

    // Simple parsing benchmarks
    runner
        .add('Parse simple tiny query', () => {
            qs.parse(fixtures.simpleQueries.tiny);
        })
        .add('Parse simple small query', () => {
            qs.parse(fixtures.simpleQueries.small);
        })
        .add('Parse simple medium query', () => {
            qs.parse(fixtures.simpleQueries.medium);
        })
        .add('Parse simple large query', () => {
            qs.parse(fixtures.simpleQueries.large);
        });

    // Nested object parsing
    runner
        .add('Parse shallow nested', () => {
            qs.parse(fixtures.nestedQueries.shallow);
        })
        .add('Parse medium nested', () => {
            qs.parse(fixtures.nestedQueries.medium);
        })
        .add('Parse deep nested', () => {
            qs.parse(fixtures.nestedQueries.deep);
        });

    // Array parsing
    runner
        .add('Parse simple array', () => {
            qs.parse(fixtures.arrayQueries.simple);
        })
        .add('Parse indexed array', () => {
            qs.parse(fixtures.arrayQueries.indexed);
        })
        .add('Parse mixed array/object', () => {
            qs.parse(fixtures.arrayQueries.mixed);
        });

    // Real-world scenarios
    runner
        .add('Parse e-commerce query', () => {
            qs.parse(fixtures.realWorldQueries.ecommerce);
        })
        .add('Parse form data', () => {
            qs.parse(fixtures.realWorldQueries.form);
        })
        .add('Parse API query', () => {
            qs.parse(fixtures.realWorldQueries.api);
        });

    // Edge cases
    runner
        .add('Parse empty values', () => {
            qs.parse(fixtures.edgeCaseQueries.emptyValues);
        })
        .add('Parse special characters', () => {
            qs.parse(fixtures.edgeCaseQueries.specialChars);
        });

    // Options testing
    runner
        .add('Parse with allowDots', () => {
            qs.parse('user.name=John&user.age=30', { allowDots: true });
        })
        .add('Parse with comma arrays', () => {
            qs.parse('colors=red,green,blue', { comma: true });
        })
        .add('Parse with depth limit', () => {
            qs.parse(fixtures.nestedQueries.deep, { depth: 2 });
        });

    // Stress tests (comment out for regular benchmarks)
    if (process.env.STRESS_TEST) {
        runner
            .add('Parse many keys (stress)', () => {
                qs.parse(fixtures.stressTestQueries.manyKeys);
            })
            .add('Parse deep nesting (stress)', () => {
                qs.parse(fixtures.stressTestQueries.deepNesting);
            })
            .add('Parse large arrays (stress)', () => {
                qs.parse(fixtures.stressTestQueries.largeArrays);
            });
    }

    await runner.run();
}

if (require.main === module) {
    runParseBenchmarks().catch(console.error);
}

module.exports = runParseBenchmarks;

