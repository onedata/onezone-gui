SRC_DIR	 ?= src
REL_DIR	 ?= rel
XVFB_ARGS ?= --server-args="-screen 0, 1366x768x24"

.PHONY: deps build_mock build_dev build_prod doc clean test test_xunit_output

all: build_dev

rel: build_prod

deps:
	cd $(SRC_DIR) && npm install
	cd $(SRC_DIR) && bower install --allow-root

build_mock: deps
	cd $(SRC_DIR) && ember build --environment=development --output-path=../$(REL_DIR)

build_dev: deps
	cd $(SRC_DIR) && ember build --environment=development-backend --output-path=../$(REL_DIR)

build_prod: deps
	cd $(SRC_DIR) && ember build --environment=production --output-path=../$(REL_DIR)

doc:
	jsdoc -c $(SRC_DIR)/.jsdoc.conf $(SRC_DIR)/app

clean:
	cd $(SRC_DIR) && rm -rf node_modules bower_components dist tmp ../$(REL_DIR)/*

test:
	cd $(SRC_DIR) && xvfb-run $(XVFB_ARGS) ember test

test_xunit_output: deps
	cd $(SRC_DIR) && xvfb-run $(XVFB_ARGS) ember test -r xunit

##
## Submodules
##

submodules:
	git submodule sync --recursive ${submodule}
	git submodule update --init --recursive ${submodule}

