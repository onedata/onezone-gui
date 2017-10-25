/**
 * Uses fake cookies to authenticate in `authenticator:onedata-websocket`
 * Used in app development
 *
 * @module authenticators/mocks/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataAuthenticatorBase from 'onedata-gui-websocket-client/authenticators/-base';
import OnedataWebsocketUtilsMock from 'onedata-gui-websocket-client/mixins/onedata-websocket-utils-mock';

import { Promise } from 'rsvp';
import { inject } from '@ember/service';

export default OnedataAuthenticatorBase.extend(OnedataWebsocketUtilsMock, {
  cookies: inject(),

  // TODO validate username/password
  authenticate() {
    this.get('cookies').write('is-authenticated', 'true');
    return this._super(...arguments);
  },

  /**
   * @override
   * @returns {Promise<undefined>}
   */
  closeConnection() {
    return Promise.resolve();
  },

  /**
   * @override
   * @returns {Promise<undefined>}
   */
  remoteInvalidate() {
    return new Promise(resolve => {
      this.get('cookies').write('is-authenticated', 'false');
      resolve();
    });
  },
});
