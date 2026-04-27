const joinParams = (count, makeParam) => Array.from({ length: count }, (_, i) => makeParam(i)).join('&');

const keyValue = (i) => `param${i}=value${i}`;

export const arrayQueries = {
	indexed: 'items[0]=first&items[1]=second&items[2]=third&items[3]=fourth&items[4]=fifth',
	mixed: 'user[name]=John&user[hobbies][]=reading&user[hobbies][]=coding&user[addresses][0][street]=123 Main&user[addresses][0][city]=NYC',
	simple: 'colors[]=red&colors[]=green&colors[]=blue',
};

export const edgeCaseQueries = {
	emptyValues: 'a=&b=&c=value&d=',
	encodedValues: 'q=hello%20world&filter=%7B%22a%22%3A1%7D&name=Jos%C3%A9',
	specialChars: 'special=%21%40%23%24%25%5E%26%2A%28%29&unicode=%E2%9C%93',
};

export const nestedQueries = {
	deep: [
		'user[profile][personal][name][first]=John',
		'user[profile][personal][name][last]=Doe',
		'user[profile][personal][address][street]=123 Main St',
		'user[profile][personal][address][city]=NYC',
	].join('&'),
	medium: 'user[profile][name]=John&user[profile][bio]=Developer&user[settings][theme]=dark',
	shallow: 'user[name]=John&user[age]=30&user[email]=john@example.com',
};

export const realWorldQueries = {
	api: [
		'fields[]=id',
		'fields[]=name',
		'fields[]=email',
		'include[]=profile',
		'include[]=settings',
		'filter[status]=active',
		'filter[created_after]=2023-01-01',
		'sort[]=name',
		'sort[]=-created_at',
		'page[number]=1',
		'page[size]=25',
	].join('&'),
	ecommerce: [
		'category=electronics',
		'subcategory=phones',
		'brand[]=apple',
		'brand[]=samsung',
		'price[min]=100',
		'price[max]=1000',
		'features[]=camera',
		'features[]=5g',
		'sort=price',
		'order=asc',
		'page=2',
		'limit=20',
	].join('&'),
	form: [
		'user[name]=John%20Doe',
		'user[email]=john%40example.com',
		'user[age]=30',
		'preferences[newsletter]=true',
		'preferences[theme]=dark',
		'address[street]=123%20Main%20St',
		'address[city]=New%20York',
		'address[zip]=10001',
	].join('&'),
};

export const simpleQueries = {
	large: joinParams(100, keyValue),
	medium: joinParams(20, keyValue),
	small: 'name=John&age=30&city=NYC&country=USA&email=john@example.com',
	tiny: 'a=1&b=2&c=3',
};

export const stressTestQueries = {
	deepNesting: `a${'[level]'.repeat(20)}=deep`,
	largeArrays: joinParams(100, (i) => `items[]=${i}`),
	manyKeys: joinParams(1000, (i) => `key${i}=value${i}`),
};

export const testObjects = {
	arrays: {
		colors: [
			'red',
			'green',
			'blue',
		],
		numbers: [
			1,
			2,
			3,
			4,
			5,
		],
	},
	large: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`key${i}`, `value${i}`])),
	mixed: {
		address: {
			city: 'NYC',
			coordinates: {
				lat: 40.7128,
				lng: -74.006,
			},
			street: '123 Main St',
		},
		hobbies: ['reading', 'coding'],
		name: 'John',
		preferences: {
			notifications: {
				email: true,
				push: false,
			},
			theme: 'dark',
		},
	},
	nested: {
		user: {
			name: 'John',
			profile: {
				age: 30,
				bio: 'Developer',
			},
		},
	},
	simple: {
		a: '1',
		b: '2',
		c: '3',
	},
};
