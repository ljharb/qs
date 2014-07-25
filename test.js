var q = require('./');
console.log(q.parse('a=c'));
console.log(q.parse('a[b]=c&a[c]=d'));
console.log(q.parse('a[b][c]=d'));
console.log(q.parse('a[b][c=d'));
console.log(q.parse('a[b][c][d][e]=f'));
