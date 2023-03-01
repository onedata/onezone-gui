/**
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import gri from 'onedata-gui-websocket-client/utils/gri';

export const aspect = 'marketplace_data';

export function generateGri(spaceId) {
  return gri({
    entityType: 'space',
    entityId: spaceId,
    aspect,
    scope: 'auto',
  });
}

export default Model.extend(GraphSingleModelMixin, {
  /**
   * Index used for infinite scroll listing.
   */
  index: attr('string'),

  name: attr('string'),
  organizationName: attr('string'),
  description: attr('string'),
  tags: attr('array', { defaultValue: () => [] }),

  // TODO: VFS-10427 use space-marketplace-info creationTime property in views
  creationTime: attr('number'),

  /**
   * Note that it may be 0 if the space is not supported at all.
   */
  totalSupportSize: attr('number'),

  /**
   * Note that it may be an empty array if the space is not supported at all.
   */
  providerNames: attr('array'),
}).reopenClass(StaticGraphModelMixin);
