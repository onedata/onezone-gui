/**
 * Exports a real onedata-websocket service or its mock.
 * @module onezone-gui/authenticators/application
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataWebsocket from 'onedata-gui-websocket-client/services/onedata-graph';
import OnedataWebsocketMock from 'onedata-gui-websocket-client/authenticators/onedata-websocket-mock';

import config from 'ember-get-config';

const {
  APP: {
    MOCK_BACKEND,
  },
} = config;

let ExportAuthenticator = MOCK_BACKEND ? OnedataWebsocketMock : OnedataWebsocket;

if (MOCK_BACKEND) {
  console.debug('authenticator:application: using mock');
}

export default ExportAuthenticator;
