'use strict';

/**
 * Benchmark comparison script that compares two benchmark results and checks for performance regressions
 *
 * Usage: node compare-benchmarks.js <baseline-result.json> <current-result.json> [threshold]
 *
 * Arguments:
 * - baseline-result.json: Path to the baseline benchmark result file
 * - current-result.json: Path to the current benchmark result file
 * - threshold: Optional performance regression threshold as a percentage (default: -10)
 *
 * Exit codes:
 * - 0: No regressions detected
 * - 1: Significant performance regression detected
 * - 2: Error in script execution
 */

const fs = require('fs');
const path = require('path');
const colors = require('colors');

// Check arguments
if (process.argv.length < 4) {
  console.error('Usage: node compare-benchmarks.js <baseline-result.json> <current-result.json> [threshold]');
  process.exit(2);
}

// Parse arguments
const baselinePath = process.argv[2];
const currentPath = process.argv[3];
const threshold = parseFloat(process.argv[4] || '-10'); // Default: 10% slowdown threshold

// Validate files
if (!fs.existsSync(baselinePath)) {
  console.error(`Error: Baseline file '${baselinePath}' does not exist`);
  process.exit(2);
}

if (!fs.existsSync(currentPath)) {
  console.error(`Error: Current file '${currentPath}' does not exist`);
  process.exit(2);
}

// Read and parse results
let baseline, current;

try {
  baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
} catch (error) {
  console.error(`Error parsing baseline file: ${error.message}`);
  process.exit(2);
}

try {
  current = JSON.parse(fs.readFileSync(currentPath, 'utf8'));
} catch (error) {
  console.error(`Error parsing current file: ${error.message}`);
  process.exit(2);
}

// Compare results
let hasSevereSlowDown = false;
const failingTests = [];
const allTests = [];

// Compare each benchmark
current.results.forEach(result => {
  const baseResult = baseline.results.find(b => b.name === result.name);
  if (!baseResult) return;

  const change = ((result.hz - baseResult.hz) / baseResult.hz * 100);

  // Add to all tests for summary report
  allTests.push({
    name: result.name,
    change: change.toFixed(2),
    current: result.hz.toLocaleString(),
    baseline: baseResult.hz.toLocaleString()
  });

  if (change < threshold) {
    failingTests.push({
      name: result.name,
      change: change.toFixed(2),
      current: result.hz.toLocaleString(),
      baseline: baseResult.hz.toLocaleString()
    });
    hasSevereSlowDown = true;
  }
});

// Calculate statistics
const changes = allTests.map(test => parseFloat(test.change));
const avgChange = changes.reduce((sum, val) => sum + val, 0) / changes.length;
const minChange = Math.min(...changes);
const maxChange = Math.max(...changes);

// Print summary
console.log(colors.blue('\n📊 Performance Comparison Summary:'));
console.log(colors.gray(`\nNode.js: ${process.version} | OS: ${process.platform}-${process.arch}`));
console.log(colors.gray(`Baseline: ${path.basename(baselinePath)} | Current: ${path.basename(currentPath)}`));
console.log(colors.gray(`Threshold: ${threshold}% | Average Change: ${avgChange.toFixed(2)}% | Range: ${minChange.toFixed(2)}% to ${maxChange.toFixed(2)}%`));

// Sort tests by change (worst first)
allTests.sort((a, b) => parseFloat(a.change) - parseFloat(b.change));

console.log('\nDETAILED RESULTS:');
allTests.forEach(test => {
  const changeNum = parseFloat(test.change);

  // Determine indicator icon based on change magnitude
  let indicator;
  if (changeNum < -5) {
    indicator = colors.red('🔻');
  } else if (changeNum < 0) {
    indicator = colors.yellow('▼');
  } else if (changeNum > 5) {
    indicator = colors.green('🔼');
  } else if (changeNum > 0) {
    indicator = colors.green('▲');
  } else {
    indicator = colors.gray('➖');
  }

  const changeText = changeNum >= 0 ? `+${test.change}%` : `${test.change}%`;

  // Determine color based on change magnitude
  let changeColor;
  if (changeNum < threshold) {
    changeColor = colors.red;
  } else if (changeNum < 0) {
    changeColor = colors.yellow;
  } else if (changeNum > 0) {
    changeColor = colors.green;
  } else {
    changeColor = colors.gray;
  }

  console.log(`${indicator} ${test.name}: ${changeColor(changeText)} (${test.current} vs ${test.baseline} ops/sec)`);
});

if (hasSevereSlowDown) {
  console.log(colors.red(`\n❌ Performance regression detected! The following tests exceed the threshold of ${Math.abs(threshold)}% slowdown:`));
  failingTests.forEach(test => {
    console.log(colors.red(`- ${test.name}: ${test.change}% (${test.current} vs ${test.baseline} ops/sec)`));
  });
  process.exit(1);
} else {
  console.log(colors.green(`\n✅ No significant performance regressions detected.`));
  process.exit(0);
}
