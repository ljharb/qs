'use strict';

const Benchmark = require('benchmark');
const { table } = require('table');
const colors = require('colors');
const fs = require('fs');
const path = require('path');

class BenchmarkRunner {
    constructor(options = {}) {
        this.options = {
            outputDir: options.outputDir || path.join(__dirname, 'results'),
            baseline: options.baseline || null,
            verbose: options.verbose || false,
            ...options
        };
        this.results = [];
        this.suite = new Benchmark.Suite();
        
        // Ensure output directory exists
        if (!fs.existsSync(this.options.outputDir)) {
            fs.mkdirSync(this.options.outputDir, { recursive: true });
        }
    }

    add(name, fn, options = {}) {
        this.suite.add(name, fn, {
            onComplete: (event) => {
                const benchmark = event.target;
                this.results.push({
                    name: benchmark.name,
                    hz: benchmark.hz,
                    rme: benchmark.stats.rme,
                    mean: benchmark.stats.mean,
                    sample: benchmark.stats.sample.length,
                    fastest: false,
                    slowest: false
                });
            },
            ...options
        });
        return this;
    }

    async run() {
        return new Promise((resolve, reject) => {
            this.suite
                .on('start', () => {
                    if (this.options.verbose) {
                        console.log(colors.blue('🚀 Starting benchmarks...'));
                    }
                })
                .on('cycle', (event) => {
                    if (this.options.verbose) {
                        console.log(colors.gray(String(event.target)));
                    }
                })
                .on('complete', () => {
                    this._markFastestSlowest();
                    this._generateReport();
                    resolve(this.results);
                })
                .on('error', reject)
                .run({ async: true });
        });
    }

    _markFastestSlowest() {
        if (this.results.length === 0) return;
        
        const sorted = [...this.results].sort((a, b) => b.hz - a.hz);
        sorted[0].fastest = true;
        sorted[sorted.length - 1].slowest = true;
    }

    _generateReport() {
        const timestamp = new Date().toISOString();
        const nodeVersion = process.version;
        const platform = `${process.platform}-${process.arch}`;

        // Console output
        this._printConsoleReport();

        // JSON output for CI/regression detection
        const jsonReport = {
            timestamp,
            nodeVersion,
            platform,
            results: this.results
        };

        const jsonPath = path.join(this.options.outputDir, `benchmark-${Date.now()}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));

        // Baseline comparison if available
        if (this.options.baseline) {
            this._compareWithBaseline(jsonReport);
        }
    }

    _printConsoleReport() {
        console.log(colors.green('\n📊 Benchmark Results\n'));
        
        const tableData = [
            ['Test Name', 'Ops/sec', 'RME', 'Samples', 'Status']
        ];

        this.results.forEach(result => {
            const opsPerSec = result.hz.toLocaleString('en-US', { maximumFractionDigits: 0 });
            const rme = `±${result.rme.toFixed(2)}%`;
            const status = result.fastest ? '🚀 Fastest' : 
                          result.slowest ? '🐌 Slowest' : '';
            
            tableData.push([
                result.name,
                opsPerSec,
                rme,
                result.sample.toString(),
                status
            ]);
        });

        console.log(table(tableData));
    }

    _compareWithBaseline(currentReport) {
        if (!fs.existsSync(this.options.baseline)) {
            console.log(colors.yellow('⚠️  Baseline file not found, skipping comparison'));
            return;
        }

        try {
            const baseline = JSON.parse(fs.readFileSync(this.options.baseline, 'utf8'));
            console.log(colors.blue('\n📈 Performance Comparison\n'));

            const comparisonData = [
                ['Test Name', 'Current', 'Baseline', 'Change', 'Status']
            ];

            currentReport.results.forEach(current => {
                const baselineResult = baseline.results.find(b => b.name === current.name);
                if (!baselineResult) return;

                const change = ((current.hz - baselineResult.hz) / baselineResult.hz * 100).toFixed(2);
                const changeStr = `${change >= 0 ? '+' : ''}${change}%`;
                const status = Math.abs(change) < 5 ? '➖ No change' :
                              change > 5 ? '✅ Improved' :
                              '⚠️ Regression';

                comparisonData.push([
                    current.name,
                    current.hz.toLocaleString('en-US', { maximumFractionDigits: 0 }),
                    baselineResult.hz.toLocaleString('en-US', { maximumFractionDigits: 0 }),
                    changeStr,
                    status
                ]);
            });

            console.log(table(comparisonData));
        } catch (error) {
            console.log(colors.red(`❌ Error comparing with baseline: ${error.message}`));
        }
    }
}

module.exports = BenchmarkRunner;

