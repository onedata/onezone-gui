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

import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
import Ember from 'ember';

const {
  inject: { service },
  RSVP: { Promise },
} = Ember;

const NOBODY_IDENTITY = 'nobody';

export default BaseAuthenticator.extend({
  onedataWebsocket: service(),

  /**
   * See if we can estabilish connection with authenticated user.
   * It is based on browser session (cookies).
   *
   * Restore is done once, only on start, so it's safe to `_tryHandshake`
   * because we are sure, that the connection was not open yet.
   *
   * Side effects: a websocket connection can be made, either anonymous or not
   *
   * @returns {Promise}
   */
  restore() {
    return this._tryHandshake();
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
    return this._forceCloseConnection().then(() => this._tryHandshake());
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
          return this._tryHandshake().then(reject, resolve);
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

  _forceCloseConnection() {
    let onedataWebsocket = this.get('onedataWebsocket');
    return new Promise(resolve =>
      onedataWebsocket.closeConnection().then(resolve, resolve)
    );
  },

  /**
   * Try to connect with backend and see if we got anonymous or non-anonymous
   * session. Resolve on non-anonymous session, reject otherwise.
   * @returns {Promise} resolves with handshake data (Object)
   */
  _tryHandshake() {
    return new Promise((resolve, reject) => {
      let init = this.get('onedataWebsocket').initConnection();
      init.then(data => {
        if (typeof data !== 'object') {
          throw new Error(
            'authorizer:onedata-websocket: invalid handshake response');
        }
        if (data.identity === NOBODY_IDENTITY) {
          reject();
        } else {
          resolve(data);
        }
      });
    });
  },
});
