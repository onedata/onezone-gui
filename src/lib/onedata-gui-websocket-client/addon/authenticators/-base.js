/**
 * A base for `ember-simple-auth` authenticators that use Onedata WebSocket API
 * Used both by real authenticator and mock authenticator
 *
 * @module authenticators/-base
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import { Promise } from 'rsvp';

export default BaseAuthenticator.extend({
  /**
   * @virtual
   * @returns {Promise<undefined>}
   */
  forceCloseConnection() {
    throw new Error('not implemented');
  },

  /**
   * @virtual
   * @returns {Promise<undefined>}
   */
  tryHandshake() {
    throw new Error('not implemented');
  },

  /**
   * @virtual
   * @returns {Promise<undefined>}
   */
  closeConnection() {
    throw new Error('not implemented');
  },

  /**
   * @virtual
   * @returns {Promise<undefined>}
   */
  remoteInvalidate() {
    throw new Error('not implemented');
  },

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
    return new Promise((resolve, reject) => {
      let remoteInvalidation = this.remoteInvalidate();
      remoteInvalidation.then(() => {
        let closing = this.closeConnection();
        closing.then(() => {
          // NOTE: reject and resolve are inverted here!
          return this.tryHandshake().then(reject, resolve);
        });
        closing.catch(reject);
      });
      remoteInvalidation.catch(reject);
    });
  },
});
