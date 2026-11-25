import { spawn, spawnSync } from 'child_process';
import {
	mkdtempSync,
	rmSync,
} from 'fs';
import { availableParallelism, tmpdir } from 'os';
import path from 'path';

import pargs from 'pargs';

const root = path.join(import.meta.dirname, '..');

const git = (args) => {
	const result = spawnSync('git', args, {
		cwd: root,
		maxBuffer: 1024 * 1024 * 1024,
	});
	if (result.status !== 0) {
		throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.error}`);
	}
	return result.stdout;
};

const allTags = String(git(['tag', '--sort=v:refname'])).split('\n').filter((tag) => (/^v\d+\.\d+\.\d+$/).test(tag));

const {
	errors,
	help,
	values,
} = await pargs(import.meta.filename, {
	description: 'Benchmarks HEAD against every tagged version of qs, and reports each version\'s speed relative to HEAD.',
	options: {
		cases: {
			description: 'also report each case\'s speed relative to HEAD',
			type: 'boolean',
		},
		concurrency: {
			default: Math.max(1, availableParallelism() - 1),
			description: 'how many versions to benchmark at once',
			type: 'integer',
		},
		'max-time': {
			default: 1,
			description: 'maximum seconds to spend on each case',
			type: 'number',
		},
		parse: {
			description: 'only run the `parse` cases',
			type: 'boolean',
		},
		ref: {
			description: 'a commitish (SHA, branch, or tag) to benchmark; with no `--tags`, only the given commitishes are benchmarked',
			multiple: true,
			placeholder: 'commitish',
			type: 'string',
		},
		since: {
			default: allTags[0],
			description: 'the oldest tag to benchmark',
			placeholder: 'tag',
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
		tags: {
			description: 'the tags to benchmark, instead of every tag from `--since` onward',
			multiple: true,
			placeholder: 'tag',
			type: 'string',
		},
	},
});

if (allTags.length === 0) {
	errors.push('no `vX.Y.Z` tags found; fetch them from https://github.com/ljharb/qs first');
} else if (!allTags.includes(values.since)) {
	errors.push(`unknown tag for \`--since\`: ${values.since}`);
}
for (const tag of values.tags ?? []) {
	if (!allTags.includes(tag)) {
		errors.push(`unknown tag for \`--tags\`: ${tag}`);
	}
}
for (const ref of values.ref ?? []) {
	if (spawnSync('git', [
		'rev-parse',
		'--verify',
		'--quiet',
		`${ref}^{commit}`,
	], { cwd: root }).status !== 0) {
		errors.push(`unknown commitish for \`--ref\`: ${ref}`);
	}
}
if (values.parse && values.stringify) {
	errors.push('`--parse` and `--stringify` are mutually exclusive');
}
if (values.concurrency < 1) {
	errors.push('`--concurrency` must be at least 1');
}

await help();

const tags = [
	...values.tags ?? (values.ref ? [] : allTags.slice(allTags.indexOf(values.since))),
	...values.ref ?? [],
];
const width = Math.max(10, ...tags.map((tag) => tag.length + 2));
const runArgs = [
	'--max-time',
	String(values['max-time']),
	...[
		'parse',
		'stringify',
		'stress',
	].filter((name) => values[name]).map((name) => `--${name}`),
];

const tmpRoot = mkdtempSync(path.join(tmpdir(), 'qs-benchmark-'));
const children = [];
const cleanUp = () => {
	children.forEach((child) => child.kill());
	rmSync(tmpRoot, { force: true, recursive: true });
};
process.on('exit', cleanUp);
process.once('SIGINT', () => {
	cleanUp();
	process.kill(process.pid, 'SIGINT');
});

const extract = (ref) => {
	// a commitish may contain `/` or other characters, or be `HEAD` itself, so give each extraction its own directory
	const dir = mkdtempSync(path.join(tmpRoot, `${ref.replace(/[^\w.-]/g, '_')}-`));
	const tar = spawnSync('tar', [
		'-x',
		'-C',
		dir,
	], {
		input: git([
			'archive',
			'--format=tar',
			ref,
		]),
	});
	if (tar.status !== 0) {
		throw new Error(`extracting ${ref} failed: ${tar.stderr || tar.error}`);
	}
	return dir;
};

const headDir = extract('HEAD');
const results = { __proto__: null };
let finished = 0;

const benchmarkTag = (tag) => new Promise((resolve) => {
	let stdout = '';
	let stderr = '';
	const child = spawn(process.execPath, [
		path.join(import.meta.dirname, 'run.mjs'),
		'--qs',
		extract(tag),
		'--baseline',
		headDir,
		...runArgs,
	], {
		env: { ...process.env, NODE_PATH: path.join(root, 'node_modules') },
	});
	children.push(child);
	child.stdout.on('data', (chunk) => {
		stdout += chunk;
	});
	child.stderr.on('data', (chunk) => {
		stderr += chunk;
	});
	child.on('close', (code) => {
		finished += 1;
		if (code === 0) {
			results[tag] = JSON.parse(stdout);
			console.log(`[${finished}/${tags.length}] ${tag}`);
		} else {
			console.error(`[${finished}/${tags.length}] ${tag} failed: ${stderr}`);
			process.exitCode = 1;
		}
		resolve();
	});
});

console.log(`benchmarking ${tags.length} versions against HEAD on node ${process.version}, ${values.concurrency} at a time\n`);

const queue = tags.slice();
const worker = () => (queue.length > 0 ? benchmarkTag(queue.shift()).then(worker) : null);
await Promise.all(Array.from({ length: Math.min(values.concurrency, tags.length) }, worker));

for (const tag of tags) {
	for (const { baselineHz, name } of results[tag] ?? []) {
		if (!baselineHz) {
			console.error(`HEAD failed \`${name}\` while running alongside ${tag}`);
			process.exitCode = 1;
		}
	}
}

const ranTags = tags.filter((tag) => results[tag]);
const ratio = ({ baselineHz, hz }) => (hz && baselineHz ? hz / baselineHz : null);

const relativeSpeed = (tag, prefix) => {
	const ratios = results[tag].filter(({ name }) => name.startsWith(prefix)).map(ratio).filter(Boolean);
	if (ratios.length === 0) {
		return 'n/a';
	}
	const geometricMean = Math.exp(ratios.reduce((sum, r) => sum + Math.log(r), 0) / ratios.length);
	return `${geometricMean.toFixed(2)}x (${ratios.length})`;
};

console.log('\nspeed relative to HEAD (geometric mean over the number of cases in parentheses; higher is faster)\n');
console.log(`${'version'.padEnd(width)}${'parse'.padEnd(16)}stringify`);
for (const tag of ranTags) {
	console.log(`${tag.padEnd(width)}${relativeSpeed(tag, 'parse: ').padEnd(16)}${relativeSpeed(tag, 'stringify: ')}`);
}

if (values.cases) {
	console.log('\nspeed relative to HEAD per case\n');
	const byCase = Map.groupBy(
		ranTags.flatMap((tag) => results[tag].map((result) => ({ result, tag }))),
		({ result }) => result.name,
	);
	for (const [name, entries] of byCase) {
		console.log(name);
		for (const { result, tag } of entries) {
			const r = ratio(result);
			console.log(`    ${tag.padEnd(width)}${r ? `${r.toFixed(2)}x` : 'n/a'}`);
		}
	}
}
