/**
 * Provides global access to signed in user record (backend data) 
 *
 * @module services/current-user
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import { oneWay } from '@ember/object/computed';

import Service, { inject } from '@ember/service';
import userGri from 'onedata-gui-websocket-client/utils/user-gri';
import { Promise, resolve } from 'rsvp';

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

  /**
   * If passed entityId matches entityId of the current user, callback is called.
   * @param {string} userEntityId 
   * @param {function} callback
   * @returns {Promise}
   */
  runIfThisUser(userEntityId, callback) {
    return this.getCurrentUserRecord()
      .then(user =>
        get(user, 'entityId') === userEntityId ? callback() : resolve()
      );
  },
});
