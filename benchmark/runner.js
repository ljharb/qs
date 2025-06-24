'use strict';

var Benchmark = require('benchmark');
var table = require('table').table;
var colors = require('colors');
var fs = require('fs');
var path = require('path');

// Load polyfills for older Node.js versions
require('./polyfills');

function BenchmarkRunner(options) {
    options = options || {};

    this.options = {
        outputDir: options.outputDir || path.join(__dirname, 'results'),
        baseline: options.baseline || null,
        verbose: options.verbose || false
    };

    // Copy any other options
    for (var key in options) {
        if (options.hasOwnProperty(key) && !this.options.hasOwnProperty(key)) {
            this.options[key] = options[key];
        }
    }

    this.results = [];
    this.suite = new Benchmark.Suite();

    // Ensure output directory exists
    if (!fs.existsSync(this.options.outputDir)) {
        fs.mkdirSync(this.options.outputDir, { recursive: true });
    }
}

BenchmarkRunner.prototype.add = function(name, fn, options) {
    options = options || {};
    var self = this;

    var completeOptions = {
        onComplete: function(event) {
            var benchmark = event.target;
            self.results.push({
                name: benchmark.name,
                hz: benchmark.hz,
                rme: benchmark.stats.rme,
                mean: benchmark.stats.mean,
                sample: benchmark.stats.sample.length,
                fastest: false,
                slowest: false
            });
        }
    };

    // Copy any other options
    for (var key in options) {
        if (options.hasOwnProperty(key)) {
            completeOptions[key] = options[key];
        }
    }

    this.suite.add(name, fn, completeOptions);
    return this;
};

BenchmarkRunner.prototype.run = function(callback) {
    var self = this;

    // For backward compatibility, if no callback is provided, return a Promise
    if (!callback && typeof Promise !== 'undefined') {
        return new Promise(function(resolve, reject) {
            self._runWithCallbacks(function(err, results) {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    return this._runWithCallbacks(callback || function() {});
};

BenchmarkRunner.prototype._runWithCallbacks = function(callback) {
    var self = this;

    this.suite
        .on('start', function() {
            if (self.options.verbose) {
                console.log(colors.blue('🚀 Starting benchmarks...'));
            }
        })
        .on('cycle', function(event) {
            if (self.options.verbose) {
                console.log(colors.gray(String(event.target)));
            }
        })
        .on('complete', function() {
            self._markFastestSlowest();
            self._generateReport();
            callback(null, self.results);
        })
        .on('error', function(err) {
            callback(err);
        })
        .run({ async: true });

    return this;
};

BenchmarkRunner.prototype._markFastestSlowest = function() {
    if (this.results.length === 0) return;

    var sorted = this.results.slice().sort(function(a, b) {
        return b.hz - a.hz;
    });
    sorted[0].fastest = true;
    sorted[sorted.length - 1].slowest = true;
};

BenchmarkRunner.prototype._generateReport = function() {
    var timestamp = new Date().toISOString();
    var nodeVersion = process.version;
    var platform = process.platform + '-' + process.arch;

    // Console output
    this._printConsoleReport();

    // JSON output for CI/regression detection
    var jsonReport = {
        timestamp: timestamp,
        nodeVersion: nodeVersion,
        platform: platform,
        results: this.results
    };

    var jsonPath = path.join(this.options.outputDir, 'benchmark-' + Date.now() + '.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));

    // Baseline comparison if available
    if (this.options.baseline) {
        this._compareWithBaseline(jsonReport);
    }
};

BenchmarkRunner.prototype._printConsoleReport = function() {
    console.log(colors.green('\n📊 Benchmark Results\n'));

    var tableData = [
        ['Test Name', 'Ops/sec', 'RME', 'Samples', 'Status']
    ];

    for (var i = 0; i < this.results.length; i++) {
        var result = this.results[i];
        var opsPerSec = result.hz.toLocaleString('en-US', { maximumFractionDigits: 0 });
        var rme = '±' + result.rme.toFixed(2) + '%';
        var status = result.fastest ? '🚀 Fastest' :
                    result.slowest ? '🐌 Slowest' : '';

        tableData.push([
            result.name,
            opsPerSec,
            rme,
            result.sample.toString(),
            status
        ]);
    }

    console.log(table(tableData));
};

BenchmarkRunner.prototype._compareWithBaseline = function(currentReport) {
    if (!fs.existsSync(this.options.baseline)) {
        console.log(colors.yellow('⚠️  Baseline file not found, skipping comparison'));
        return;
    }

    try {
        var baseline = JSON.parse(fs.readFileSync(this.options.baseline, 'utf8'));
        console.log(colors.blue('\n📈 Performance Comparison\n'));

        var comparisonData = [
            ['Test Name', 'Current', 'Baseline', 'Change', 'Status']
        ];

        for (var i = 0; i < currentReport.results.length; i++) {
            var current = currentReport.results[i];
            var baselineResult = null;

            for (var j = 0; j < baseline.results.length; j++) {
                if (baseline.results[j].name === current.name) {
                    baselineResult = baseline.results[j];
                    break;
                }
            }

            if (!baselineResult) continue;

            var change = ((current.hz - baselineResult.hz) / baselineResult.hz * 100).toFixed(2);
            var changeStr = (change >= 0 ? '+' : '') + change + '%';
            var status = Math.abs(change) < 5 ? '➖ No change' :
                        change > 5 ? '✅ Improved' :
                        '⚠️ Regression';

            comparisonData.push([
                current.name,
                current.hz.toLocaleString('en-US', { maximumFractionDigits: 0 }),
                baselineResult.hz.toLocaleString('en-US', { maximumFractionDigits: 0 }),
                changeStr,
                status
            ]);
        }

        console.log(table(comparisonData));
    } catch (error) {
        console.log(colors.red('❌ Error comparing with baseline: ' + error.message));
    }
};

module.exports = BenchmarkRunner;

module.exports = BenchmarkRunner;

