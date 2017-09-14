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

import gri from 'onedata-gui-websocket-client/utils/gri';

export default Mixin.create({
  onedataGraph: inject(),

  /**
   * @param {string} receiverType one of: user, group
   * @returns {Promise<string>}
   */
  getInviteToken(receiverType) {
    let {
      entityType,
      entityId,
    } = this.getProperties('entityType', 'entityId');
    return this.get('onedataGraph').request({
      gri: gri(entityType, entityId, `invite_${receiverType}_token`),
      operation: 'create',
    }).then(({ data }) => data);
  },
});
