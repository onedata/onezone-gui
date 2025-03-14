/**
 * A route for loading a view associated with some specific resource.
 * It is an extended version of the same route from onedata-gui-common.
 * It adds support for GRI.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataSidebarContentRoute from 'onedata-gui-common/routes/onedata/sidebar/content';
import modelRoutableId from 'onezone-gui/utils/model-routable-id';
import { inject as service } from '@ember/service';

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

export default OnedataSidebarContentRoute.extend({
  recordManager: service(),
  sidebarResources: service(),

  /**
   * @override
   */
  availableResourceId(resourceId, collection) {
    const griIds = collection.ids;
    return findGri(griIds, resourceId);
  },
});
