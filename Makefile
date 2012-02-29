
test:
	@./node_modules/.bin/mocha \
		--require should \
		--ui bdd

.PHONY: test