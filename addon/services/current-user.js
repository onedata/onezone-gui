/**
 * Provides global access to signed in user record (backend data) 
 *
 * @module services/current-user
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject } from '@ember/service';
import { computed } from '@ember/object';
import userGri from 'onedata-gui-websocket-client/utils/user-gri';

export default Service.extend({
  store: inject(),
  session: inject(),

  userId: computed.oneWay('session.data.authenticated.identity.user'),

  getCurrentUserRecord() {
    let store = this.get('store');
    let userId = this.get('userId');
    if (!userId) {
      throw new 'service:current-user: session unauthenticated or user id is not set';
    }
    return store.findRecord(
      'user',
      userGri(userId)
    );
  },
});
