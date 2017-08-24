/**
 * Exports a real onedata-websocket service or its mock.
 * @module onezone-gui/service/onedata-websocket-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataWebsocket from 'onedata-gui-websocket-client/services/onedata-websocket';
import OnedataWebsocketMock from 'onedata-gui-websocket-client/services/onedata-websocket-mock';

import config from 'ember-get-config';

const {
  APP: {
    MOCK_BACKEND,
  },
} = config;

let ExportService = MOCK_BACKEND ? OnedataWebsocketMock : OnedataWebsocket;

if (MOCK_BACKEND) {
  console.debug('service:onedata-websocket: using mock');
}

export default ExportService;
