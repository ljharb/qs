import {
	arrayQueries,
	edgeCaseQueries,
	nestedQueries,
	realWorldQueries,
	simpleQueries,
	stressTestQueries,
} from './fixtures.mjs';

export default function addParseCases(suite, qs, stress) {
	suite
		.add('parse: simple tiny query', () => qs.parse(simpleQueries.tiny))
		.add('parse: simple small query', () => qs.parse(simpleQueries.small))
		.add('parse: simple medium query', () => qs.parse(simpleQueries.medium))
		.add('parse: simple large query', () => qs.parse(simpleQueries.large))
		.add('parse: shallow nested', () => qs.parse(nestedQueries.shallow))
		.add('parse: medium nested', () => qs.parse(nestedQueries.medium))
		.add('parse: deep nested', () => qs.parse(nestedQueries.deep))
		.add('parse: simple array', () => qs.parse(arrayQueries.simple))
		.add('parse: indexed array', () => qs.parse(arrayQueries.indexed))
		.add('parse: mixed array/object', () => qs.parse(arrayQueries.mixed))
		.add('parse: e-commerce query', () => qs.parse(realWorldQueries.ecommerce))
		.add('parse: form data', () => qs.parse(realWorldQueries.form))
		.add('parse: API query', () => qs.parse(realWorldQueries.api))
		.add('parse: empty values', () => qs.parse(edgeCaseQueries.emptyValues))
		.add('parse: special characters', () => qs.parse(edgeCaseQueries.specialChars))
		.add('parse: with allowDots', () => qs.parse('user.name=John&user.age=30', { allowDots: true }))
		.add('parse: with comma arrays', () => qs.parse('colors=red,green,blue', { comma: true }))
		.add('parse: with depth limit', () => qs.parse(nestedQueries.deep, { depth: 2 }));

	if (stress) {
		suite
			.add('parse: many keys (stress)', () => qs.parse(stressTestQueries.manyKeys))
			.add('parse: deep nesting (stress)', () => qs.parse(stressTestQueries.deepNesting))
			.add('parse: large arrays (stress)', () => qs.parse(stressTestQueries.largeArrays));
	}

	return suite;
}
