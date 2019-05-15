/**
 * Adds computed properties for fetching Oneprovider-specific data of cluster
 * 
 * @module mixin/models/oneprovider-cluster-info
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { computed } from '@ember/object';
import { reject } from 'rsvp';

export default Mixin.create({
  // virtual: type
  // virtual: hasViewPrivilege
  // virtual: oneproviderEntityId
  // virtual: onedataGraph

  oneproviderEffectiveUsers: computedOneproviderClusterInfo('eff_users'),
  oneproviderEffectiveGroups: computedOneproviderClusterInfo('eff_groups'),
  oneproviderSpaces: computedOneproviderClusterInfo('spaces'),

  getOneproviderClusterInfo(aspect) {
    const {
      type,
      hasViewPrivilege,
    } = this.getProperties('type', 'hasViewPrivilege');
    if (type !== 'oneprovider') {
      return reject('mixin:oneprovider-cluster-info: cluster type is not oneprovider');
    } else if (!hasViewPrivilege) {
      return reject('mixin:oneprovider-cluster-info: forbidden');
    } else {
      const {
        oneproviderEntityId,
        onedataGraph,
      } = this.getProperties('oneproviderEntityId', 'onedataGraph');
      return onedataGraph.request({
        gri: gri({
          entityType: 'provider',
          entityId: oneproviderEntityId,
          aspect,
        }),
        operation: 'get',
        subscribe: false,
      });
    }
  },
});

function computedOneproviderClusterInfo(aspect) {
  return computed('hasViewPrivilege', 'type', function () {
    return this.getOneproviderClusterInfo(aspect);
  });
}
