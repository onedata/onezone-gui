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

#### Use onedata-gui-websocket-client authenticator

The authenticator use by `ember-simple-auth` session is placed in:
`onedata-gui-websocket-client/authenticators/onedata-websocket`

Please export it as a default authenticator. You should also conditionally export mocked authenticator, for example:

```javascript
import OnedataWebsocket from 'onedata-gui-websocket-client/authenticators/onedata-websocket';
import OnedataWebsocketMock from 'onedata-gui-websocket-client/authenticators/onedata-websocket-mock';

import config from 'ember-get-config';

const { APP: { MOCK_BACKEND } } = config;
let ExportAuthenticator = MOCK_BACKEND ? OnedataWebsocketMock : OnedataWebsocket;
export default ExportAuthenticator;
```

#### Other important exports

Please export following modules in Ember:
- `application:session-store` -> `onedata-gui-websocket-client/session-stores/onedata-websocket`
- `application:serializer` -> `onedata-gui-websocket-client/serializers/onedata-websocket`


## Tests and mocks included

- `authenticator:mocks/onedata-websocket`
  - on `authorize` it adds a valid authorization cookie for mocked handshake in `service:mocks/onedata-websocket`
  - used in development app runs
- `service:mocks/onedata-websocket-base`
  - do not use WebSocket connection, but instead it allows to use internal functions that can be mocked
  - used to test higher layers: `service:onedata-rpc` and `service:onedata-graph`
  - used as a base for cookies-mock (below)
- `mixins/services/onedata-websocket-cookies-handshake`
  - implemements `handleSendHandshake` for `service:backend-mock/onedata-websocket-base` that checks if fake cookie is set
- `service:mocks/onedata-websocket`
  - allows handshake without backend
  - used in development app runs
- `service:mock/onedata-rpc`
  - should be used for development app runs that uses RPC
- `service:mock/onedata-graph`
  - used as mock for adapter tests
  - should be used for development app runs that uses model (be a mock for real adapter)