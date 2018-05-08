About
=====

*onezone-gui* is GUI written in Ember distributed with OZ worker.

Goals
-----

This repo allows to separate GUI from OZ worker repos, which improves
ease of maintenance and lowers build times.

It is able to build a release containing only compiled GUI static files
and create a static docker with those files.

Getting Started
---------------
Before building make sure submodules are initialized:
```
make submodules
```

To build a development release of GUI:

```
make             # run natively (requires npm, bower, ember)
./make.py        # run in docker (onedata/gui_builder) that has all deps
```
<br />

To build a production release of GUI:

```
make rel         # run natively (requires npm, bower, ember)
./make.py rel    # run in docker (onedata/gui_builder) that has all deps
```
<br />

To package a built release into a static docker:

```
./sr-dockerbuild
```
<br />

To package a built release into a static docker and
push it to docker repo:

```
./sr-dockerbuild --push --remove
```
<br />

To get more info on ****sr-dockerbuild.sh**** usage:

```
./sr-dockerbuild --help
```
<br />

To start an ember build process that watches for changes and rebuilds:

```
./build_watch.sh
```
<br />

To find all broken symbolic links (those that point to nothing):

```
./find_broken_links.sh
```
<br />

Support
-------

For more information visit onedata.org
