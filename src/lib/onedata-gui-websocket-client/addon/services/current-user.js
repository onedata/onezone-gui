/**
 * Provides global access to signed in user record (backend data) 
 *
 * @module services/current-user
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { oneWay } from '@ember/object/computed';

import Service, { inject } from '@ember/service';
import userGri from 'onedata-gui-websocket-client/utils/user-gri';
import { Promise } from 'rsvp';

export default Service.extend({
  store: inject(),
  session: inject(),

  userId: oneWay('session.data.authenticated.identity.user'),

  getCurrentUserRecord() {
    const {
      store,
      userId,
    } = this.getProperties('store', 'userId');
    if (!userId) {
      return Promise.reject(
        'service:current-user: session unauthenticated or user id is not set'
      );
    }
    return store.findRecord(
      'user',
      userGri(userId)
    );
  },
});
