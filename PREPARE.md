# Evaluation Setup

This file is outside the editable surface. It defines how results are judged. Agents cannot modify the evaluator or the scoring logic — the evaluation is the trust boundary.

Consider defining more than one evaluation criterion. Optimizing for a single number makes it easy to overfit and silently break other things. A secondary metric or sanity check helps keep the process honest.

eval_cores: 1
eval_memory_gb: 1.0
prereq_command: npm run tests-only

## Setup

Install dependencies and prepare the evaluation environment:

```bash
npm install
```

The `prereq_command` runs the full test suite to ensure all changes maintain correctness. The qs library is pure JavaScript with no compilation step.

## Run command

```bash
node benchmark.js
```

The benchmark measures throughput of both parse and stringify operations on representative workloads including simple key-value pairs, nested objects, arrays, URL-encoded strings, and complex nested structures.

## Output format

The benchmark must print `METRIC=<number>` to stdout.

## Metric parsing

The CLI looks for `METRIC=<number>` or `ops_per_sec=<number>` in the output.

## Ground truth

The baseline metric represents operations per second (ops/sec) for a mixed workload of querystring parsing and stringifying operations. Each iteration performs 5 parse operations (simple, nested, arrays, encoded, complex) and 4 stringify operations (simple, nested, arrays, complex) for a total of 900,000 operations across 100,000 iterations.

Baseline measurement on the current codebase yields approximately 220,000 ops/sec. The metric is stable across runs with variance < 5%.
