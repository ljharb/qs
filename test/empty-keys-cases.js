'use strict';

module.exports = {
    emptyTestCases: [
        { input: '&', withEmptyKeys: {}, stringifyOutput: '', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },
        { input: '&&', withEmptyKeys: {}, stringifyOutput: '', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },
        { input: '&=', withEmptyKeys: { '': '' }, stringifyOutput: '=', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },
        { input: '&=&', withEmptyKeys: { '': '' }, stringifyOutput: '=', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },
        { input: '&=&=', withEmptyKeys: { '': ['', ''] }, stringifyOutput: '[0]=&[1]=', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },
        { input: '&=&=&', withEmptyKeys: { '': ['', ''] }, stringifyOutput: '[0]=&[1]=', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },

        { input: '=', withEmptyKeys: { '': '' }, noEmptyKeys: {}, stringifyOutput: '=', stringifyOutputNoEmpty: '' },
        { input: '=&', withEmptyKeys: { '': '' }, stringifyOutput: '=', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },
        { input: '=&&&', withEmptyKeys: { '': '' }, stringifyOutput: '=', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },
        { input: '=&=&=&', withEmptyKeys: { '': ['', '', ''] }, stringifyOutput: '[0]=&[1]=&[2]=', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },
        { input: '=&a[]=b&a[1]=c', withEmptyKeys: { '': '', a: ['b', 'c'] }, stringifyOutput: '=&a[0]=b&a[1]=c', noEmptyKeys: { a: ['b', 'c'] }, stringifyOutputNoEmpty: 'a[0]=b&a[1]=c' },
        { input: '=a', withEmptyKeys: { '': 'a' }, noEmptyKeys: {}, stringifyOutput: '=a', stringifyOutputNoEmpty: '' },
        { input: '=a', withEmptyKeys: { '': 'a' }, noEmptyKeys: {}, stringifyOutput: '=a', stringifyOutputNoEmpty: '' },
        { input: 'a==a', withEmptyKeys: { a: '=a' }, noEmptyKeys: { a: '=a' }, stringifyOutput: 'a==a', stringifyOutputNoEmpty: 'a==a' },

        { input: '=&a[]=b', withEmptyKeys: { '': '', a: ['b'] }, stringifyOutput: '=&a[0]=b', noEmptyKeys: { a: ['b'] }, stringifyOutputNoEmpty: 'a[0]=b' },
        { input: '=&a[]=b&a[]=c&a[2]=d', withEmptyKeys: { '': '', a: ['b', 'c', 'd'] }, stringifyOutput: '=&a[0]=b&a[1]=c&a[2]=d', noEmptyKeys: { a: ['b', 'c', 'd'] }, stringifyOutputNoEmpty: 'a[0]=b&a[1]=c&a[2]=d' },
        { input: '=a&=b', withEmptyKeys: { '': ['a', 'b'] }, stringifyOutput: '[0]=a&[1]=b', noEmptyKeys: {}, stringifyOutputNoEmpty: '' },
        { input: '=a&foo=b', withEmptyKeys: { '': 'a', foo: 'b' }, noEmptyKeys: { foo: 'b' }, stringifyOutput: '=a&foo=b', stringifyOutputNoEmpty: 'foo=b' },

        { input: 'a[]=b&a=c&=', withEmptyKeys: { '': '', a: ['b', 'c'] }, stringifyOutput: '=&a[0]=b&a[1]=c', noEmptyKeys: { a: ['b', 'c'] }, stringifyOutputNoEmpty: 'a[0]=b&a[1]=c' },
        { input: 'a[]=b&a=c&=', withEmptyKeys: { '': '', a: ['b', 'c'] }, stringifyOutput: '=&a[0]=b&a[1]=c', noEmptyKeys: { a: ['b', 'c'] }, stringifyOutputNoEmpty: 'a[0]=b&a[1]=c' },
        { input: 'a[0]=b&a=c&=', withEmptyKeys: { '': '', a: ['b', 'c'] }, stringifyOutput: '=&a[0]=b&a[1]=c', noEmptyKeys: { a: ['b', 'c'] }, stringifyOutputNoEmpty: 'a[0]=b&a[1]=c' },
        { input: 'a=b&a[]=c&=', withEmptyKeys: { '': '', a: ['b', 'c'] }, stringifyOutput: '=&a[0]=b&a[1]=c', noEmptyKeys: { a: ['b', 'c'] }, stringifyOutputNoEmpty: 'a[0]=b&a[1]=c' },
        { input: 'a=b&a[0]=c&=', withEmptyKeys: { '': '', a: ['b', 'c'] }, stringifyOutput: '=&a[0]=b&a[1]=c', noEmptyKeys: { a: ['b', 'c'] }, stringifyOutputNoEmpty: 'a[0]=b&a[1]=c' },

        { input: '[]=a&[]=b& []=1', withEmptyKeys: { '': ['a', 'b'], ' ': ['1'] }, stringifyOutput: '[0]=a&[1]=b& [0]=1', noEmptyKeys: { 0: 'a', 1: 'b', ' ': ['1'] }, stringifyOutputNoEmpty: '0=a&1=b& [0]=1' },
        { input: '[0]=a&[1]=b&a[0]=1&a[1]=2', withEmptyKeys: { '': ['a', 'b'], a: ['1', '2'] }, noEmptyKeys: { 0: 'a', 1: 'b', a: ['1', '2'] }, stringifyOutput: '[0]=a&[1]=b&a[0]=1&a[1]=2', stringifyOutputNoEmpty: '0=a&1=b&a[0]=1&a[1]=2' },
        { input: '[deep]=a&[deep]=2', withEmptyKeys: { '': { deep: ['a', '2'] } }, stringifyOutput: '[deep][0]=a&[deep][1]=2', noEmptyKeys: { deep: ['a', '2'] }, stringifyOutputNoEmpty: 'deep[0]=a&deep[1]=2' },
        { input: '%5B0%5D=a&%5B1%5D=b', withEmptyKeys: { '': ['a', 'b'] }, stringifyOutput: '[0]=a&[1]=b', noEmptyKeys: { 0: 'a', 1: 'b' }, stringifyOutputNoEmpty: '0=a&1=b' }
    ]
};
