# QS Library Benchmarking Suite

This directory contains a comprehensive benchmarking infrastructure for the `qs` library, designed to measure performance across different Node.js versions and detect performance regressions.

## Features

- 🚀 **Comprehensive Test Coverage**: Parse and stringify operations across various scenarios
- 📊 **Cross-Node Version Testing**: Automated testing from Node.js 0.8 through current versions
- 📈 **Regression Detection**: Compare performance against baselines
- 🔄 **CI Integration**: Automated benchmarks on every PR and push
- 📋 **Detailed Reporting**: Visual tables with performance metrics
- 💾 **Historical Tracking**: Track performance trends over time

## Quick Start

### Install Dependencies
```bash
cd benchmark
npm install
```

### Run All Benchmarks
```bash
# Run all benchmarks
node index.js

# Run only parse benchmarks
node index.js --parse

# Run only stringify benchmarks
node index.js --stringify
```

### Compare with Baseline
```bash
# Save current results as baseline
node index.js --save-baseline

# Compare against baseline
node index.js --baseline baseline.json
```

## Test Scenarios

### Parse Benchmarks
- **Simple queries**: `a=1&b=2&c=3`
- **Nested objects**: `user[profile][name]=John`
- **Arrays**: `colors[]=red&colors[]=green`
- **Real-world cases**: E-commerce, forms, APIs
- **Edge cases**: Empty values, special characters
- **Different options**: `allowDots`, `comma`, `depth`

### Stringify Benchmarks
- **Simple objects**: `{a: '1', b: '2'}`
- **Nested objects**: `{user: {name: 'John'}}`
- **Arrays**: `{colors: ['red', 'green']}`
- **Array formats**: indices, brackets, repeat, comma
- **Options**: `allowDots`, encoding, delimiters
- **Edge cases**: null values, empty arrays

## Performance Metrics

Each benchmark reports:
- **Operations per second (Hz)**: Primary performance metric
- **Relative margin of error (RME)**: Statistical reliability
- **Sample size**: Number of test runs
- **Fastest/Slowest indicators**: Comparative performance

## Example Output

```
📊 Benchmark Results

┌──────────────────────────────┬──────────────┬──────────┬─────────┬────────────┐
│ Test Name                    │ Ops/sec      │ RME      │ Samples │ Status     │
├──────────────────────────────┼──────────────┼──────────┼─────────┼────────────┤
│ Parse simple tiny query      │ 2,451,234    │ ±1.23%   │ 89      │ 🚀 Fastest │
│ Parse simple small query     │ 1,876,543    │ ±0.87%   │ 92      │            │
│ Parse nested object          │ 923,456      │ ±1.45%   │ 85      │            │
│ Parse complex array          │ 654,321      │ ±2.12%   │ 78      │ 🐌 Slowest │
└──────────────────────────────┴──────────────┴──────────┴─────────┴────────────┘
```

## Baseline Comparison

When comparing against a baseline:

```
📈 Performance Comparison

┌──────────────────────────────┬─────────────┬─────────────┬─────────┬─────────────┐
│ Test Name                    │ Current     │ Baseline    │ Change  │ Status      │
├──────────────────────────────┼─────────────┼─────────────┼─────────┼─────────────┤
│ Parse simple query           │ 2,451,234   │ 2,234,567   │ +9.70%  │ ✅ Improved │
│ Parse nested object          │ 923,456     │ 934,123     │ -1.14%  │ ➖ No change│
│ Parse complex array          │ 654,321     │ 724,891     │ -9.73%  │ ⚠️ Regression│
└──────────────────────────────┴─────────────┴─────────────┴─────────┴─────────────┘
```

## Command Line Options

```bash
node benchmark/index.js [options]

Options:
  --parse              Run only parse benchmarks
  --stringify          Run only stringify benchmarks
  --baseline FILE      Compare results against baseline file
  --save-baseline      Save current results as baseline
  --no-summary         Skip summary report
  --help               Show help

Environment Variables:
  STRESS_TEST=1        Include stress test scenarios
```

## Adding New Benchmarks

### 1. Add Test Data
Edit `fixtures.js` to add new test scenarios:

```javascript
const newScenarios = {
    myNewTest: 'complex=query&string=here'
};
```

### 2. Add Benchmark
In `parse.js` or `stringify.js`:

```javascript
runner.add('My new test case', () => {
    qs.parse(fixtures.newScenarios.myNewTest);
});
```

### 3. Test Locally
```bash
node index.js --parse
```

## Performance Guidelines

### What to Benchmark
- ✅ Core functionality (parse/stringify)
- ✅ Common real-world scenarios
- ✅ Edge cases that might be slow
- ✅ Different option combinations
- ✅ Large inputs (stress tests)

### What NOT to Benchmark
- ❌ Trivial operations
- ❌ Error conditions (use unit tests)
- ❌ Platform-specific features
- ❌ Operations that vary by environment

### Interpreting Results

- **5%+ improvement**: Significant performance gain ✅
- **±5% change**: No meaningful change ➖
- **5%+ regression**: Potential performance issue ⚠️

## Troubleshooting

### Inconsistent Results
- Ensure system is not under load
- Run multiple times and average
- Check for background processes

### Memory Issues
- Use `--max-old-space-size=4096` for large tests
- Monitor memory usage during stress tests

### CI Failures
- Check Node version compatibility
- Verify all dependencies are installed
- Review benchmark timeout settings

## File Structure

```
benchmark/
├── index.js          # Main benchmark runner
├── runner.js         # Benchmark infrastructure
├── fixtures.js       # Test data generators
├── parse.js          # Parse function benchmarks
├── stringify.js      # Stringify function benchmarks
├── package.json      # Benchmark dependencies
├── README.md         # This documentation
└── results/          # Generated benchmark results
    ├── benchmark-*.json
    └── baseline.json
```

## Contributing

When adding performance optimizations:

1. **Run baseline first**: `node index.js --save-baseline`
2. **Make your changes**: Implement optimization
3. **Run comparison**: `node index.js --baseline baseline.json`
4. **Verify improvements**: Check for positive performance changes
5. **Include stress tests**: `STRESS_TEST=1 node index.js`

This ensures your optimization actually improves performance and doesn't introduce regressions.

