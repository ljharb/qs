#!/usr/bin/env node
'use strict';

var runParseBenchmarks = require('./parse');
var runStringifyBenchmarks = require('./stringify');
var colors = require('colors');
var fs = require('fs');
var path = require('path');

// Load polyfills for older Node.js versions
require('./polyfills');

function main(callback) {
    var args = process.argv.slice(2);
    var options = parseArgs(args);

    console.log(colors.blue.bold('🚀 QS Library Benchmarks'));
    console.log(colors.gray('Node.js ' + process.version + ' on ' + process.platform + '-' + process.arch + '\n'));

    if (options.baseline) {
        console.log(colors.yellow('📊 Comparing against baseline: ' + options.baseline + '\n'));
    }

    // Step 1: Run parse benchmarks if needed
    function runParse() {
        if (options.parse || options.all) {
            runParseBenchmarks(function(err) {
                if (err) {
                    return handleError(err);
                }
                console.log('\n' + repeatString('=', 60) + '\n');
                runStringify();
            });
        } else {
            runStringify();
        }
    }

    // Step 2: Run stringify benchmarks if needed
    function runStringify() {
        if (options.stringify || options.all) {
            runStringifyBenchmarks(function(err) {
                if (err) {
                    return handleError(err);
                }
                console.log('\n' + repeatString('=', 60) + '\n');
                finalize();
            });
        } else {
            finalize();
        }
    }

    // Step 3: Finalize benchmarks
    function finalize() {
        // Generate summary report
        if (options.summary) {
            generateSummaryReport();
        }

        console.log(colors.green('✅ Benchmarks completed successfully!'));

        if (options.save) {
            saveBaseline();
        }

        if (callback) callback(null);
    }

    // Handle errors
    function handleError(error) {
        console.error(colors.red('❌ Benchmark failed:'), error.message);
        if (callback) callback(error);
        else process.exit(1);
    }

    // Start the process
    runParse();
}

// Helper function for repeating strings (replacement for String.repeat)
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

function parseArgs(args) {
    var options = {
        all: true,
        parse: false,
        stringify: false,
        baseline: null,
        summary: true,
        save: false
    };

    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        switch (arg) {
            case '--parse':
                options.parse = true;
                options.all = false;
                break;
            case '--stringify':
                options.stringify = true;
                options.all = false;
                break;
            case '--baseline':
                if (i + 1 < args.length) {
                    options.baseline = args[i + 1];
                    i++;
                }
                break;
            case '--save-baseline':
                options.save = true;
                break;
            case '--no-summary':
                options.summary = false;
                break;
            case '--help':
                printHelp();
                process.exit(0);
            default:
                if (arg.indexOf('--') === 0) {
                    console.error(colors.red('Unknown option: ' + arg));
                    printHelp();
                    process.exit(1);
                }
        }
    }

    return options;
}

function printHelp() {
    console.log(
        '\n' + colors.blue.bold('QS Benchmark Suite') +
        '\n\n' + colors.yellow('Usage:') +
        '\n  node benchmark/index.js [options]' +
        '\n\n' + colors.yellow('Options:') +
        '\n  --parse              Run only parse benchmarks' +
        '\n  --stringify          Run only stringify benchmarks' +
        '\n  --baseline FILE      Compare results against baseline file' +
        '\n  --save-baseline      Save current results as baseline' +
        '\n  --no-summary         Skip summary report' +
        '\n  --help               Show this help' +
        '\n\n' + colors.yellow('Examples:') +
        '\n  node benchmark/index.js                           # Run all benchmarks' +
        '\n  node benchmark/index.js --parse                   # Run only parse benchmarks' +
        '\n  node benchmark/index.js --baseline baseline.json  # Compare with baseline' +
        '\n  node benchmark/index.js --save-baseline           # Save as new baseline' +
        '\n  STRESS_TEST=1 node benchmark/index.js             # Include stress tests' +
        '\n\n' + colors.yellow('Environment Variables:') +
        '\n  STRESS_TEST=1        Include stress test scenarios' +
        '\n'
    );
}

function generateSummaryReport() {
    var resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) return;

    var files = fs.readdirSync(resultsDir)
        .filter(function(f) {
            return f.indexOf('benchmark-') === 0 && f.indexOf('.json') === f.length - 5;
        })
        .sort();

    // Get the last 5 runs
    if (files.length > 5) {
        files = files.slice(files.length - 5);
    }

    if (files.length === 0) return;

    console.log(colors.blue('\n📈 Performance Trend (Last 5 Runs)\n'));

    var trends = {};
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var data = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf8'));

        for (var j = 0; j < data.results.length; j++) {
            var result = data.results[j];
            if (!trends[result.name]) trends[result.name] = [];
            trends[result.name].push(result.hz);
        }
    }

    for (var testName in trends) {
        if (trends.hasOwnProperty(testName)) {
            var values = trends[testName];
            if (values.length < 2) continue;

            var latest = values[values.length - 1];
            var previous = values[values.length - 2];
            var change = ((latest - previous) / previous * 100).toFixed(2);
            var trend;

            if (change > 5) {
                trend = '📈';
            } else if (change < -5) {
                trend = '📉';
            } else {
                trend = '➖';
            }

            var changeText = (change >= 0 ? '+' : '') + change + '%';
            console.log(trend + ' ' + testName + ': ' + changeText);
        }
    }
}

function saveBaseline() {
    var resultsDir = path.join(__dirname, 'results');
    var files = fs.readdirSync(resultsDir)
        .filter(function(f) {
            return f.indexOf('benchmark-') === 0 && f.indexOf('.json') === f.length - 5;
        })
        .sort();

    if (files.length === 0) return;

    var latest = files[files.length - 1];
    var baselinePath = path.join(__dirname, 'baseline.json');

    // Copy file - Node.js 0.8 doesn't have fs.copyFileSync
    var content = fs.readFileSync(path.join(resultsDir, latest));
    fs.writeFileSync(baselinePath, content);

    console.log(colors.green('💾 Baseline saved to ' + baselinePath));
}

if (require.main === module) {
    main(function(err) {
        if (err) {
            console.error(err);
            process.exit(1);
        }
    });
}

module.exports = { main: main };

