/**
 * Provides functions that deal with priviliges.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Service.extend({
  onedataGraph: service(),
  recordManager: service(),

  /**
   * Generates privilege record GRI
   * @param {string} parentType `group` or `space`
   * @param {string} parentRecordEntityId
   * @param {string} memberType `group`, `child` or `user`
   * @param {string} memberRecordEntityId
   * @param {boolean} effective if true, fetch effective privileges
   * @returns {string}
   */
  generateGri(
    parentType,
    parentRecordEntityId,
    memberType,
    memberRecordEntityId,
    effective,
  ) {
    const recordManager = this.get('recordManager');
    return gri({
      entityType: recordManager.getEntityTypeForModelName(parentType),
      entityId: parentRecordEntityId,
      aspect: recordManager.getEntityTypeForModelName(memberType) +
        (effective ? '_eff' : '') + '_privileges',
      aspectId: memberRecordEntityId,
    });
  },

  /**
   * Fetches privileges preset for specified model. Preset object looks like:
   * ```
   * {
   *   member: Array<String>,
   *   manager: Array<String>,
   *   admin: Array<String>
   * }
   * ```
   * where each array of strings contains a list of default privileges.
   * @param {String} modelName one of: space, group, harvester, cluster
   * @returns {Promise<Object>}
   */
  getPrivilegesPresetForModel(modelName) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');
    return onedataGraph.request({
      gri: gri({
        entityType: recordManager.getEntityTypeForModelName(modelName),
        entityId: 'null',
        aspect: 'privileges',
        scope: 'private',
      }),
      operation: 'get',
      subscribe: false,
    });
  },
});
