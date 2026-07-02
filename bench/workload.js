'use strict';

/* eslint-disable */

var qs = require('../lib');

var cases = [
    ['flat', 'a=1&b=2&c=3&d=4&e=5', 4, 50000],
    ['nested', 'user[name]=alice&user[email]=a%40b.com&user[prefs][theme]=dark&user[prefs][lang]=en', 3, 30000],
    ['arrays', 'ids[]=1&ids[]=2&ids[]=3&ids[]=4&ids[]=5&tags[]=red&tags[]=blue', 2, 30000],
    ['encoded', 'q=hello%20world&filter=%7B%22a%22%3A1%7D&name=Jos%C3%A9', 2, 40000],
    ['search', 'page=3&per_page=25&sort=created_at&order=desc&filter[status]=active&filter[role]=admin&q=foo%20bar', 3, 25000]
];

function benchOne(input, iters) {
    var w;
    for (w = 0; w < 200; w++) {
        qs.parse(input);
    }
    var runs = [];
    var r;
    var i;
    var t0;
    var dt;
    for (r = 0; r < 5; r++) {
        t0 = process.hrtime.bigint();
        for (i = 0; i < iters; i++) {
            qs.parse(input);
        }
        dt = Number(process.hrtime.bigint() - t0) / 1e9;
        runs.push(iters / dt);
    }
    runs.sort(function (a, b) { return a - b; });
    return runs[Math.floor(runs.length / 2)];
}

var totalWeight = 0;
var weightedSum = 0;
var perCase = [];
var c;
var name;
var input;
var weight;
var iters;
var ops;
for (c = 0; c < cases.length; c++) {
    name = cases[c][0];
    input = cases[c][1];
    weight = cases[c][2];
    iters = cases[c][3];
    ops = benchOne(input, iters);
    perCase.push([name, ops]);
    weightedSum += ops * weight;
    totalWeight += weight;
}

var weighted = weightedSum / totalWeight;

process.stderr.write('per-case ops/sec:\n');
var p;
for (p = 0; p < perCase.length; p++) {
    process.stderr.write('  ' + perCase[p][0] + ': ' + perCase[p][1].toFixed(0) + '\n');
}
process.stderr.write('weighted: ' + weighted.toFixed(0) + '\n');

process.stdout.write(weighted.toFixed(0) + '\n');
