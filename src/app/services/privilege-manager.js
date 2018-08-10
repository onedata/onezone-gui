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
   * Generates privilege model GRI
   * @param {string} parentType `group` or `space`
   * @param {string} parentModelEntityId
   * @param {string} memberType `group`, `child` or `user`
   * @param {string} memberModelEntityId
   * @returns {string}
   */
  generateGri(
    parentType,
    parentModelEntityId,
    memberType,
    memberModelEntityId
  ) {
    return gri({
      entityType: parentType,
      entityId: parentModelEntityId,
      aspect: memberType + '_privileges',
      aspectId: memberModelEntityId,
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
