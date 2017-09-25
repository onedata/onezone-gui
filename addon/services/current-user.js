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
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Service.extend({
  store: inject(),
  session: inject(),
  currentUser: inject(),

  userId: computed.oneWay('session.data.authenticated.identity.user'),

  /**
   * Resolve record of currently signed-in user
   * @returns {Promise<OnedataWebsocket.User>}
   */
  getCurrentUserRecord() {
    let {
      store,
      userId,
    } = this.getProperties('store', 'userId');
    if (!userId) {
      throw new 'service:current-user: session unauthenticated or user id is not set';
    }
    return store.findRecord(
      'user',
      gri('od_user', userId, 'instance', 'protected')
    );
  },
});
