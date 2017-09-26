/**
 * Allows this record to "invite" some user or group to it
 *
 * @module mixins/models/intiving-model
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';

export default Mixin.create({
  onedataTokenApi: inject(),

  /**
   * @param {string} receiverType one of: user, group
   * @returns {Promise<string, any>}
   */
  getInviteToken(receiverType) {
    let {
      entityType,
      entityId,
    } = this.getProperties('entityType', 'entityId');

    return this.get('onedataTokenApi')
      .getInviteToken(entityType, entityId, receiverType);
  },
});
