import { createRequire } from 'module';
import path from 'path';
import { pathToFileURL } from 'url';

import Benchmark from 'benchmark';
import pargs from 'pargs';

import addParseCases from './parse.mjs';
import addStringifyCases from './stringify.mjs';

const {
	errors,
	help,
	values,
} = await pargs(import.meta.filename, {
	options: {
		baseline: {
			description: 'path to the qs to compare against',
			type: 'string',
		},
		'max-time': {
			description: 'maximum seconds to spend on each case',
			type: 'number',
		},
		parse: {
			description: 'only run the `parse` cases',
			type: 'boolean',
		},
		qs: {
			description: 'path to the qs to benchmark',
			type: 'string',
		},
		stress: {
			description: 'also run the stress cases',
			type: 'boolean',
		},
		stringify: {
			description: 'only run the `stringify` cases',
			type: 'boolean',
		},
	},
});

for (const name of [
	'baseline',
	'max-time',
	'qs',
]) {
	if (typeof values[name] === 'undefined') {
		errors.push(`\`--${name}\` is required`);
	}
}

await help();

const resolve = createRequire(import.meta.url).resolve;
const loadQs = async (dir) => (await import(pathToFileURL(resolve(path.resolve(dir))))).default;

const collectCases = (qs) => {
	const cases = [];
	const collector = {
		add(name, fn) {
			cases.push({ fn, name });
			return collector;
		},
	};
	if (!values.stringify) {
		addParseCases(collector, qs, values.stress);
	}
	if (!values.parse) {
		addStringifyCases(collector, qs);
	}
	return cases;
};

Benchmark.options.maxTime = values['max-time'];

const cases = collectCases(await loadQs(values.qs));
const baselineCases = collectCases(await loadQs(values.baseline));

const suite = new Benchmark.Suite();
cases.forEach(({ fn, name }, i) => {
	suite
		.add(name, fn)
		.add(`${name} (baseline)`, baselineCases[i].fn);
});

const results = [];
let pending = null;
suite
	.on('cycle', ({ target }) => {
		const hz = target.error ? null : target.hz;
		if (pending) {
			results.push({ ...pending, baselineHz: hz });
			pending = null;
		} else {
			pending = { hz, name: target.name };
		}
	})
	.on('complete', () => {
		console.log(JSON.stringify(results));
	})
	.run();
