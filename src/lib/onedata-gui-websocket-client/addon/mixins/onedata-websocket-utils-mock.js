/**
 * Additional util functions that facilitate usage of onedata-websocket service
 * Implements functions needed by `authenticator:onedata-websocket` for development
 * environment
 *
 * @module mixins/onedata-websocket-utils-mock
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';

export default Mixin.create({
  cookies: inject(),

  /**
   * @override
   * @returns {Promise<object>} resolves with session data
   */
  tryHandshake() {
    let isAuthenticated = this.get('cookies').read('is-authenticated') === 'true';
    let user = 'stub_user_id';
    if (isAuthenticated) {
      return Promise.resolve({
        version: 1,
        sessionId: 'stub_session_id',
        identity: { user },
        attributes: {},
      });
    } else {
      return Promise.reject();
    }
  },

  /**
   * @override
   * @returns {Promise<undefined>}
   */
  forceCloseConnection() {
    return Promise.resolve();
  },
});
