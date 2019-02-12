/**
 * A route for loading a view associated with some specific resource.
 * It is an extended version of the same route from onedata-gui-common.
 * It adds support for GRI.
 *
 * @module routes/onedata/sidebar/content
 * @author Michal Borzecki
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataSidebarContentRoute from 'onedata-gui-common/routes/onedata/sidebar/content';
import isRecord from 'onedata-gui-common/utils/is-record';
import modelRoutableId from 'onezone-gui/utils/model-routable-id';
import { get } from '@ember/object';
import RedirectRoute from 'onedata-gui-common/mixins/routes/redirect';

/**
 * Finds GRI in griIds using pure entityId.
 * @param {Array<string>} griIds
 * @param {string} entityId
 * @returns {string|undefined}
 */
function findGri(griIds, entityId) {
  let recordId;
  for (let i = 0; i < griIds.length; i++) {
    const griEntityId = modelRoutableId(griIds[i]);
    if (griEntityId && entityId === griEntityId) {
      recordId = griIds[i];
      break;
    }
  }
  return recordId;
}

export default OnedataSidebarContentRoute.extend(RedirectRoute, {
  /**
   * @override
   */
  availableResourceId(resourceId, collection) {
    const griIds = isRecord(collection) ?
      collection.hasMany('list').ids() :
      get(collection, 'list').map(record => get(record, 'id'));
    return findGri(griIds, resourceId);
  },

  /**
   * @override
   */
  isRedirectingTransition(transition) {
    const params = get(transition, 'params');
    const sidebarParams = params['onedata.sidebar'];
    return Boolean(sidebarParams && sidebarParams.type === 'clusters');
  },

  /**
   * @override 
   */
  checkComeFromOtherRoute(currentHash) {
    return !/\/onedata\/clusters\/.+?\/.+/.test(currentHash);
  },
});
