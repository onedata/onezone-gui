SRC_DIR	 ?= src
REL_DIR	 ?= rel
XVFB_ARGS ?= --server-args="-screen 0, 1366x768x24"
EMBER_CMD = npx --no-install ember
XVFB_CMD = xvfb-run $(XVFB_ARGS)

.PHONY: deps build_mock build_dev build_prod run_tests run_tests_xunit_output dev mock rel test test_xunit_output clean lint submodules

all: dev

src/node_modules: src/package.json
	cd $(SRC_DIR) && npm run deps

deps: src/node_modules

build_mock:
	cd $(SRC_DIR) && $(EMBER_CMD) build --environment=development --output-path=../$(REL_DIR)

build_dev:
	cd $(SRC_DIR) && $(EMBER_CMD) build --environment=development-backend --output-path=../$(REL_DIR)

build_prod:
	cd $(SRC_DIR) && $(EMBER_CMD) build --environment=production --output-path=../$(REL_DIR)

run_tests:
	cd $(SRC_DIR) && $(XVFB_CMD) $(EMBER_CMD) test

run_tests_xunit_output:
	cd $(SRC_DIR) && $(XVFB_CMD) $(EMBER_CMD) test -r xunit

dev: deps build_dev

mock: deps build_mock

rel: deps build_prod

test: deps run_tests

test_xunit_output: deps run_tests_xunit_output

clean:
	cd $(SRC_DIR) && npm run clean

lint: src/node_modules
	cd $(SRC_DIR) && npm run lint

##
## Submodules
##

submodules:
	git submodule sync --recursive ${submodule}
	git submodule update --init --recursive ${submodule}

