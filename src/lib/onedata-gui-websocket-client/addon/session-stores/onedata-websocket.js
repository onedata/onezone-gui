/**
 * Somehow fake store for session - on each restore, try to use browser session
 * to communicate with server - it will response with session data
 *
 * @module session-stores/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { Promise } from 'rsvp';

import BaseSessionStore from 'ember-simple-auth/session-stores/base';
import OnedataWebsocketUtils from 'onedata-gui-websocket-client/mixins/onedata-websocket-utils';

import _ from 'lodash';

export default BaseSessionStore.extend(OnedataWebsocketUtils, {

  persist( /* data */ ) {
    // complete ignore of persist - the "store" is remote server
    return Promise.resolve();
  },

  restore() {
    let closing = this.forceCloseConnection();
    let handshaking = closing.then(() => this.tryHandshake());
    return new Promise(resolve => {
      handshaking.then(handshakeData =>
        resolve({
          authenticated: _.merge(handshakeData, { authenticator: 'authenticator:onedata-websocket' }),
        }));
      handshaking.catch(() => resolve({}));
    });
  },
});
