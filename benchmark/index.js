#!/usr/bin/env node
'use strict';

const runParseBenchmarks = require('./parse');
const runStringifyBenchmarks = require('./stringify');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

async function main() {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    console.log(chalk.blue.bold('🚀 QS Library Benchmarks'));
    console.log(chalk.gray(`Node.js ${process.version} on ${process.platform}-${process.arch}\n`));

    if (options.baseline) {
        console.log(chalk.yellow(`📊 Comparing against baseline: ${options.baseline}\n`));
    }

    try {
        if (options.parse || options.all) {
            await runParseBenchmarks();
            console.log('\n' + '='.repeat(60) + '\n');
        }

        if (options.stringify || options.all) {
            await runStringifyBenchmarks();
            console.log('\n' + '='.repeat(60) + '\n');
        }

        // Generate summary report
        if (options.summary) {
            generateSummaryReport();
        }

        console.log(chalk.green('✅ Benchmarks completed successfully!'));
        
        if (options.save) {
            saveBaseline();
        }

    } catch (error) {
        console.error(chalk.red('❌ Benchmark failed:'), error.message);
        process.exit(1);
    }
}

function parseArgs(args) {
    const options = {
        all: true,
        parse: false,
        stringify: false,
        baseline: null,
        summary: true,
        save: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
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
                options.baseline = args[++i];
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
                if (arg.startsWith('--')) {
                    console.error(chalk.red(`Unknown option: ${arg}`));
                    printHelp();
                    process.exit(1);
                }
        }
    }

    return options;
}

function printHelp() {
    console.log(`
${chalk.blue.bold('QS Benchmark Suite')}

${chalk.yellow('Usage:')}
  node benchmark/index.js [options]

${chalk.yellow('Options:')}
  --parse              Run only parse benchmarks
  --stringify          Run only stringify benchmarks
  --baseline FILE      Compare results against baseline file
  --save-baseline      Save current results as baseline
  --no-summary         Skip summary report
  --help               Show this help

${chalk.yellow('Examples:')}
  node benchmark/index.js                           # Run all benchmarks
  node benchmark/index.js --parse                   # Run only parse benchmarks
  node benchmark/index.js --baseline baseline.json  # Compare with baseline
  node benchmark/index.js --save-baseline           # Save as new baseline
  STRESS_TEST=1 node benchmark/index.js             # Include stress tests

${chalk.yellow('Environment Variables:')}
  STRESS_TEST=1        Include stress test scenarios
`);
}

function generateSummaryReport() {
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) return;

    const files = fs.readdirSync(resultsDir)
        .filter(f => f.startsWith('benchmark-') && f.endsWith('.json'))
        .sort()
        .slice(-5); // Last 5 runs

    if (files.length === 0) return;

    console.log(chalk.blue('\n📈 Performance Trend (Last 5 Runs)\n'));

    const trends = {};
    files.forEach(file => {
        const data = JSON.parse(fs.readFileSync(path.join(resultsDir, file), 'utf8'));
        data.results.forEach(result => {
            if (!trends[result.name]) trends[result.name] = [];
            trends[result.name].push(result.hz);
        });
    });

    Object.entries(trends).forEach(([testName, values]) => {
        if (values.length < 2) return;
        
        const latest = values[values.length - 1];
        const previous = values[values.length - 2];
        const change = ((latest - previous) / previous * 100).toFixed(2);
        const trend = change > 5 ? '📈' : change < -5 ? '📉' : '➖';
        
        console.log(`${trend} ${testName}: ${change >= 0 ? '+' : ''}${change}%`);
    });
}

function saveBaseline() {
    const resultsDir = path.join(__dirname, 'results');
    const files = fs.readdirSync(resultsDir)
        .filter(f => f.startsWith('benchmark-') && f.endsWith('.json'))
        .sort();
    
    if (files.length === 0) return;
    
    const latest = files[files.length - 1];
    const baselinePath = path.join(__dirname, 'baseline.json');
    
    fs.copyFileSync(path.join(resultsDir, latest), baselinePath);
    console.log(chalk.green(`💾 Baseline saved to ${baselinePath}`));
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };

