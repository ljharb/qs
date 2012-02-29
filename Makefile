
querystring.js: lib/head.js lib/querystring.js lib/tail.js
	cat $^ > $@ 

test:
	@./node_modules/.bin/mocha \
		--ui bdd

.PHONY: test