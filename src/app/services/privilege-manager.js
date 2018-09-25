/**
 * Provides functions that deal with priviliges.
 *
 * @module services/privilege-manager
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import _ from 'lodash';

export default Service.extend({
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

  /**
   * Flattens privileges tree (object) to the array representation compatible
   * with privilege model
   * @param {Object} privilegesTree 
   * @returns {Array<string>}
   */
  treeToArray(privilegesTree) {
    const flattenedPrivilegesTree = _.assign({}, ..._.values(privilegesTree));
    return Object.keys(flattenedPrivilegesTree)
      .filter(key => flattenedPrivilegesTree[key]);
  },
});
