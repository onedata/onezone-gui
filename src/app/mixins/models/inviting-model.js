/**
 * Allows this record to "invite" another record to it
 *
 * @module mixins/models/intiving-model
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export default Mixin.create({
  onedataTokenApi: service(),
  tokenManager: service(),

  /**
   * @param {string} receiverType one of: user, group, space
   * @returns {Promise<string, any>}
   */
  getInviteToken(receiverType) {
    const {
      entityType,
      entityId,
      onedataTokenApi,
      tokenManager,
    } = this.getProperties(
      'entityType',
      'entityId',
      'onedataTokenApi',
      'tokenManager'
    );

    return onedataTokenApi.getInviteToken(entityType, entityId, receiverType)
      .then(result => {
        tokenManager.reloadListIfAlreadyFetched();
        return result;
      });
  },
});
