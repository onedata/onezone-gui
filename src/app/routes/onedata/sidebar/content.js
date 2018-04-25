/**
 * A route for loading a view associated with some specific resource.
 * It is an extended version of the same route from onedata-gui-common.
 * It adds support for gri.
 *
 * @module routes/onedata/sidebar/content
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataSidebarContentRoute from 'onedata-gui-common/routes/onedata/sidebar/content';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import isRecord from 'onedata-gui-common/utils/is-record';
import { get } from '@ember/object';

/**
 * Finds gri in griIds using pure entityId.
 * @param {Array<string>} griIds
 * @param {string} id
 * @returns {string|undefined}
 */
function findGri(griIds, id) {
  let modelId;
  for (let i = 0; i < griIds.length; i++) {
    let parsedGri;
    try {
      parsedGri = parseGri(griIds[i]);
    } catch (error) {
      continue;
    }
    const entityId = parsedGri.aspect === 'client_token' ?
      parsedGri.aspectId : parsedGri.entityId;
    if (!entityId) {
      continue;
    }
    if (id === entityId) {
      modelId = griIds[i];
      break;
    }
  }
  return modelId;
}

export default OnedataSidebarContentRoute.extend({
  /**
   * @override
   */
  availableResourceId(resourceId, collection) {
    const griIds = isRecord(collection) ?
      collection.hasMany('list').ids() :
      get(collection, 'list').map(model => get(model, 'id'));
    return findGri(griIds, resourceId);
  },
});
