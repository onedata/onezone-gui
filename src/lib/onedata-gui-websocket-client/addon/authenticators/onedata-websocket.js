/**
 * An authenticator for `ember-simple-auth` that uses Onedata WebSocket API
 *
 * Using `onedata-websocket` service internally
 *
 * @module authenticators/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import OnedataWebsocketUtils from 'onedata-gui-websocket-client/mixins/onedata-websocket-utils';

const {
  inject: { service },
  RSVP: { Promise },
} = Ember;

export default BaseAuthenticator.extend(OnedataWebsocketUtils, {
  onedataWebsocket: service(),

  /**
   * Just pass authenticated data from session-store
   * @param {object} data a handshake data
   * @returns {Promise<object>} resolves with passed data
   */
  restore(data) {
    return Promise.resolve(data);
  },

  /**
   * When we authenticate, we don't know if there is an anonymous connection
   * estabilished already, so we first force connection to close and then try
   * to estabilish a non-anonymous connection.
   *
   * Side effects: a websocket connection can be made, either anonymous or not
   *
   * @returns {Promise}
   */
  authenticate() {
    return this.forceCloseConnection().then(() => this.tryHandshake());
  },

  /**
   * To logout user from session, we should call server to remove its session.
   * It should invalidate our cookies with session, so after closing WebSocket
   * connection, we can try if handshake will give us anonymous connection
   * (what is expected).
   *
   * TODO: test this code in real scenario, because WS connection can be
   * unexpectedly closed after lost of valid session.
   *
   * Side effects: if everything goes fine, an anonymous WS connection will be
   * estabilished
   *
   * @returns {Promise} resolves when an anonymous connection is established
   */
  invalidate() {
    let onedataWebsocket = this.get('onedataWebsocket');
    return new Promise((resolve, reject) => {
      let remoteInvalidate = this.remoteInvalidate();
      remoteInvalidate.then(() => {
        let closing = onedataWebsocket.closeConnection();
        closing.then(() => {
          // NOTE: reject and resolve are inverted here!
          return this.tryHandshake().then(reject, resolve);
        });
        closing.catch(reject);
      });
      remoteInvalidate.catch(reject);
    });
  },

  /**
   * Invalidate session on remote
   * @returns {Promise} resolves when session on server side has been
   *  invalidated successfully
   */
  remoteInvalidate() {
    return $.post('/logout');
  },
});
