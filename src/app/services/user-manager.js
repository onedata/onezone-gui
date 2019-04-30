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

export default Service.extend({
  onedataGraph: service(),

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
        entityType: 'user',
        entityId: userEntityId,
        aspect: 'password',
        scope: 'private',
      }),
      operation: 'update',
      subscribe: false,
      data: {
        oldPassword,
        newPassword,
      },
    });
  },
});
