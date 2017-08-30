/**
 * Uses fake cookies to authenticate in `authenticator:onedata-websocket`
 * Used in app development
 *
 * @module authenticators/mocks/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

import OnedataWebsocketAuthenticator from 'onedata-gui-websocket-client/authenticators/onedata-websocket';

const {
  inject: { service },
  RSVP: { Promise },
} = Ember;

export default OnedataWebsocketAuthenticator.extend({
  onedataWebsocket: service(),
  cookies: service(),

  // TODO validate username/password
  authenticate() {
    this.get('cookies').write('is-authenticated', 'true');
    return this._super(...arguments);
  },

  /**
   * @override
   */
  remoteInvalidate() {
    return new Promise(resolve => {
      this.get('cookies').write('is-authenticated', 'false');
      resolve();
    });
  },
});
