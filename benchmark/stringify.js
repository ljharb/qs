'use strict';

const BenchmarkRunner = require('./runner');
const fixtures = require('./fixtures');
const qs = require('../lib/index');

async function runStringifyBenchmarks() {
    console.log('🔗 Running Stringify Benchmarks...\n');
    
    const runner = new BenchmarkRunner({
        verbose: true,
        outputDir: './benchmark/results'
    });

    // Simple object stringifying
    runner
        .add('Stringify simple object', () => {
            qs.stringify(fixtures.testObjects.simple);
        })
        .add('Stringify nested object', () => {
            qs.stringify(fixtures.testObjects.nested);
        })
        .add('Stringify arrays', () => {
            qs.stringify(fixtures.testObjects.arrays);
        })
        .add('Stringify mixed object', () => {
            qs.stringify(fixtures.testObjects.mixed);
        })
        .add('Stringify large object', () => {
            qs.stringify(fixtures.testObjects.large);
        });

    // Different array formats
    runner
        .add('Stringify array indices format', () => {
            qs.stringify(fixtures.testObjects.arrays, { arrayFormat: 'indices' });
        })
        .add('Stringify array brackets format', () => {
            qs.stringify(fixtures.testObjects.arrays, { arrayFormat: 'brackets' });
        })
        .add('Stringify array repeat format', () => {
            qs.stringify(fixtures.testObjects.arrays, { arrayFormat: 'repeat' });
        })
        .add('Stringify array comma format', () => {
            qs.stringify(fixtures.testObjects.arrays, { arrayFormat: 'comma' });
        });

    // Different options
    runner
        .add('Stringify with allowDots', () => {
            qs.stringify(fixtures.testObjects.nested, { allowDots: true });
        })
        .add('Stringify without encoding', () => {
            qs.stringify(fixtures.testObjects.mixed, { encode: false });
        })
        .add('Stringify with query prefix', () => {
            qs.stringify(fixtures.testObjects.simple, { addQueryPrefix: true });
        })
        .add('Stringify with custom delimiter', () => {
            qs.stringify(fixtures.testObjects.simple, { delimiter: ';' });
        });

    // Edge cases
    const edgeObjects = {
        nullValues: { a: null, b: '', c: 'value' },
        undefinedValues: { a: undefined, b: 'value', c: null },
        emptyArrays: { arr: [], obj: {}, value: 'test' },
        specialChars: { special: '!@#$%^&*()', unicode: '✓' }
    };

    runner
        .add('Stringify null values', () => {
            qs.stringify(edgeObjects.nullValues);
        })
        .add('Stringify with strictNullHandling', () => {
            qs.stringify(edgeObjects.nullValues, { strictNullHandling: true });
        })
        .add('Stringify with skipNulls', () => {
            qs.stringify(edgeObjects.nullValues, { skipNulls: true });
        })
        .add('Stringify special characters', () => {
            qs.stringify(edgeObjects.specialChars);
        });

    await runner.run();
}

if (require.main === module) {
    runStringifyBenchmarks().catch(console.error);
}

module.exports = runStringifyBenchmarks;

