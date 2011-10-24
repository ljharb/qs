
test:
	@./node_modules/.bin/expresso \
		-I support \
		-I lib

.PHONY: test