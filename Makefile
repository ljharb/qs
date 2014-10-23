test:
	@node node_modules/lab/bin/lab -L
test-cov:
	@node node_modules/lab/bin/lab -t 100 -L
test-cov-html:
	@node node_modules/lab/bin/lab -L -r html -o coverage.html

.PHONY: test test-cov test-cov-html
