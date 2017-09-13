/**
 * Additional util functions that facilitate usage of onedata-websocket service
 * Implements functions needed by `authenticator:onedata-websocket` for production
 * environment
 *
 * @module mixins/onedata-websocket-utils
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';

const NOBODY_IDENTITY = 'nobody';

export default Mixin.create({
  onedataWebsocket: inject(),

  /**
   * Forces connection close on onedata-websocket service
   * @returns {Promise.Object} should always resolve
   *   (with onedata-WS close connection data or error)
   */
  forceCloseConnection() {
    let onedataWebsocket = this.get('onedataWebsocket');
    return new Promise(resolve =>
      onedataWebsocket.closeConnection().then(resolve, resolve)
    );
  },

  /**
   * Try to connect with backend and see if we got anonymous or non-anonymous
   * session. Resolve on non-anonymous session, reject otherwise.
   * @returns {Promise.Object} resolves with handshake data (Object)
   */
  tryHandshake() {
    let onedataWebsocket = this.get('onedataWebsocket');
    return new Promise((resolve, reject) => {
      let init = onedataWebsocket.initConnection();
      init.then(data => {
        if (typeof data !== 'object') {
          throw new Error(
            'authorizer:onedata-websocket: invalid handshake response'
          );
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
