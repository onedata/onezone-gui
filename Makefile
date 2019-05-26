SRC_DIR	 ?= src
REL_DIR	 ?= rel

.PHONY: deps build_mock build_dev build_prod doc clean test tesxt_xunit_output pull_onedata_gui_common push_onedata_gui_common

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

test: deps
	cd $(SRC_DIR) && xvfb-run ember test

test_xunit_output: deps
	cd $(SRC_DIR) && xvfb-run ember test -r xunit

pull_onedata_gui_common:
	git subtree pull --prefix=src/lib/onedata-gui-common onedata-gui-common `git rev-parse --abbrev-ref HEAD`

push_onedata_gui_common: pull_onedata_gui_common
	git subtree push --prefix=src/lib/onedata-gui-common onedata-gui-common `git rev-parse --abbrev-ref HEAD`

##
## Submodules
##

submodules:
	git submodule sync --recursive ${submodule}
	git submodule update --init --recursive ${submodule}

