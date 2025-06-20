import { testObjects } from './fixtures.mjs';

const nullValues = {
	a: null,
	b: '',
	c: 'value',
};

const specialChars = {
	special: '!@#$%^&*()',
	unicode: '✓',
};

export default function addStringifyCases(suite, qs) {
	return suite
		.add('stringify: simple object', () => qs.stringify(testObjects.simple))
		.add('stringify: nested object', () => qs.stringify(testObjects.nested))
		.add('stringify: arrays', () => qs.stringify(testObjects.arrays))
		.add('stringify: mixed object', () => qs.stringify(testObjects.mixed))
		.add('stringify: large object', () => qs.stringify(testObjects.large))
		.add('stringify: array indices format', () => qs.stringify(testObjects.arrays, { arrayFormat: 'indices' }))
		.add('stringify: array brackets format', () => qs.stringify(testObjects.arrays, { arrayFormat: 'brackets' }))
		.add('stringify: array repeat format', () => qs.stringify(testObjects.arrays, { arrayFormat: 'repeat' }))
		.add('stringify: array comma format', () => qs.stringify(testObjects.arrays, { arrayFormat: 'comma' }))
		.add('stringify: with allowDots', () => qs.stringify(testObjects.nested, { allowDots: true }))
		.add('stringify: without encoding', () => qs.stringify(testObjects.mixed, { encode: false }))
		.add('stringify: with query prefix', () => qs.stringify(testObjects.simple, { addQueryPrefix: true }))
		.add('stringify: with custom delimiter', () => qs.stringify(testObjects.simple, { delimiter: ';' }))
		.add('stringify: null values', () => qs.stringify(nullValues))
		.add('stringify: with strictNullHandling', () => qs.stringify(nullValues, { strictNullHandling: true }))
		.add('stringify: with skipNulls', () => qs.stringify(nullValues, { skipNulls: true }))
		.add('stringify: special characters', () => qs.stringify(specialChars));
}
