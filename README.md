# onedata-gui-websocket-client

## About

*onedata-gui-websocket-client* is an EmberJS in-repo addon that contains services, session and example component to use Onedata Websocket API in Onedata frontends. Used i.a. by:
- `onezone-gui`

## Versioning

Currently this addon is not versioned due to its dynamic nature.

## Usage in projects

Use this repo as a subtree in Ember application ``lib`` directory, which in case of Onedata apps is placed in: ``src/lib/``.

### Updating addon code

To update addon:

- add a remote: ``git remote add onedata-gui-websocket-client ssh://git@git.plgrid.pl:7999/vfs/onedata-gui-websocket-client.git``
- pull recent changes: ``git subtree pull --squash --prefix=src/lib/onedata-gui-websocket-client onedata-gui-websocket-client`` (you can use other branch name than ``develop``)

### Modifying addon code in projects that use it

If you want to modify this addon from specific Onedata project, after pulling recent version of addon, do from project's root:

- make changes in ``src/lib/onedata-gui-websocket-client`` and commit them
- push changes to project's repo: ``git push``
- push changes to addon repo: ``git subtree push --squash --prefix=src/lib/onedata-gui-websocket-client onedata-gui-websocket-client <branch_name>``

### Initializing project with addon

**Note:** this documentation section may be incomplete and serves as an overview.

#### Installing dependencies for this addon in project

In ``package.json`` of Ember app project:

- add an ember addon in "ember-addon" path, eg.:
```json
"ember-addon": {
  "paths": [
    "lib/onedata-gui-websocket-client"
  ]
}
```

Then dependencies of the in-repo addon should be installed to the parent project.
It is required as in this issue on Github: https://github.com/ember-cli/ember-cli/issues/4164

#### Default exports

Please export following modules in Ember app:
- `session-store:application` -> `onedata-gui-websocket-client/session-stores/application`
- `serializer:application` -> `onedata-gui-websocket-client/serializers/application`
- `adapter:application` -> `onedata-gui-websocket-client/serializers/application`


## Tests and mocks included

Some of injected services and modules have special export, that chooses version of implementation between websocket implementation and mocked version for development. These are:
- adapter
- authenticator
- serializer
- session-store
- onedata-rpc
- onedata-token-api

The `onedata-websocket` service has this kind of export too, but it's only for throwing error when it is tried to be used in development mode.


## Development environment and model

In development mode, the mock model will be created on entering application route using localstorage adapter.
If you want to clear the storage, you can clear localstorage in your browser or just invoke:
```javascript
AppName.__container__.lookup('adapter:application').clearLocalStorage()
```
where `AppName` is object with Ember Application, eg. OnezoneGui.
