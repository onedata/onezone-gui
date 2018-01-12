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

import OnedataBaseAuthenticator from 'onedata-gui-websocket-client/authenticators/-base';
import OnedataWebsocketUtils from 'onedata-gui-websocket-client/mixins/onedata-websocket-utils';
import xhrToPromise from 'onedata-gui-websocket-client/utils/xhr-to-promise';
import Promise from 'rsvp';

import { inject } from '@ember/service';

export default OnedataBaseAuthenticator.extend(OnedataWebsocketUtils, {
  onedataWebsocket: inject(),

  /**
   * @override
   * @param {string} username 
   * @param {string} password
   */
  authenticate(username, password) {
    return ((username && password) ? doLogin(username, password) : Promise.resolve())
      .then(() => this.forceCloseConnection())
      .then(() => this.tryHandshake());
  },

  /**
   * @override
   * @returns {Promise<undefined>}
   */
  closeConnection() {
    return this.get('onedataWebsocket').closeConnection(...arguments);
  },

  /**
   * Invalidate session on remote
   * @returns {Promise} resolves when session on server side has been
   *  invalidated successfully
   */
  remoteInvalidate() {
    return xhrToPromise($.get('/do_logout'));
  },
});

/**
 * Makes REST request to create authenticated HTTP session
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise} a promise with then, catch and finally method
 *   based on jqPromise; resolves when username and password are valid
 *   and session is created; rejects otherwise
 */
function doLogin(username, password) {
  const jqPromise = $.ajax('/do_login', {
    method: 'POST',
    beforeSend: (xhr) => {
      xhr.setRequestHeader(
        'Authorization',
        'Basic ' + btoa(`${username}:${password}`)
      );
    },
  });
  return xhrToPromise(jqPromise);
}
