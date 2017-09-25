/**
 * Implementation of session service for `ember-simple-auth` using
 * Onedata Websocket Sync API
 *
 * @module services/onedata-websocket-session
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import SimpleAuthSession from 'ember-simple-auth/services/session';

export default SimpleAuthSession.extend({
  authenticate() {
    let authPromise = this._super(...arguments);
    // reset flags
    authPromise.finally(() => this.set('data.hasExpired', false));
    return authPromise;
  },
});
