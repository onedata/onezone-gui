/**
 * Mock of Onedata Websocket WebSocket API - Graph level service
 *
 * @module services/mocks/onedata-graph
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataGraphMock, { messageNotSupported } from 'onedata-gui-websocket-client/services/mocks/onedata-graph';
import { resolve } from 'rsvp';
import _ from 'lodash';

const spaceHandlers = {
  provider(operation) {
    if (operation !== 'delete') {
      return messageNotSupported;
    }
    return resolve();
  },
};

export default OnedataGraphMock.extend({
  _handlers: Object.freeze({
    space: spaceHandlers,
  }),

  init() {
    this._super(...arguments);
    this.set(
      'handlers',
      _.merge({}, this.get('handlers'), this.get('_handlers'))
    );
  },
});
