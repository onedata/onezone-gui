/**
 * Provides functions that deal with users.
 *
 * @module services/user-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as userEntityType } from 'onezone-gui/models/user';

export default Service.extend({
  onedataGraph: service(),
  store: service(),

  /**
   * Changes user password
   * @param {string} userEntityId
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise} resolves if password has been changed successfully
   */
  changeUserPassword(userEntityId, oldPassword, newPassword) {
    const onedataGraph = this.get('onedataGraph');
    return onedataGraph.request({
      gri: gri({
        entityType: userEntityType,
        entityId: userEntityId,
        aspect: 'password',
        scope: 'private',
      }),
      operation: 'update',
      subscribe: false,
      data: {
        oldPassword: oldPassword || null,
        newPassword,
      },
    });
  },

  /**
   * Returns user with specified GRI
   * @param {String} gri
   * @return {Promise<Models.User>} user promise
   */
  getRecord(gri) {
    return this.get('store').findRecord('user', gri);
  },

  /**
   * Returns user with specified entityId
   * @param {String} entityId
   * @return {Promise<Models.User>} user promise
   */
  getRecordById(entityId) {
    const recordGri = gri({
      entityType: userEntityType,
      entityId: entityId,
      aspect: 'instance',
      scope: 'auto',
    });
    return this.getRecord(recordGri);
  },

  /**
   * @param {Models.User} user 
   * @returns {Promise}
   */
  remove(user) {
    return user.destroyRecord();
  },
});
