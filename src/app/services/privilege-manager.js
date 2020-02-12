/**
 * Provides functions that deal with priviliges.
 *
 * @module services/privilege-manager
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Service.extend({
  onedataGraph: service(),

  /**
   * Generates privilege record GRI
   * @param {string} parentType `group` or `space`
   * @param {string} parentRecordEntityId
   * @param {string} memberType `group`, `child` or `user`
   * @param {string} memberRecordEntityId
   * @returns {string}
   */
  generateGri(
    parentType,
    parentRecordEntityId,
    memberType,
    memberRecordEntityId
  ) {
    return gri({
      entityType: parentType,
      entityId: parentRecordEntityId,
      aspect: memberType + '_privileges',
      aspectId: memberRecordEntityId,
    });
  },

  getPrivilegesPresetForModel(modelName) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: modelName,
        entityId: 'null',
        aspect: 'privileges',
        scope: 'private',
      }),
      operation: 'get',
      subscribe: false,
    });
  },
});
