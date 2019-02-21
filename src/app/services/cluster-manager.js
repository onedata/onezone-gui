/**
 * Provides data and operations for routes and components assoctiated with clusters tab.
 *
 * @module services/cluster-manager
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { Promise } from 'rsvp';

function loadClusterRecord(cluster) {
  return Promise.all([
    cluster.updateDomainProxy(),
    cluster.updateNameProxy(),
  ]).then(() => cluster);
}

export default Service.extend({
  currentUser: service(),
  store: service(),
  onedataGraph: service(),

  getClusters() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => get(user, 'clusterList'));
  },

  getRecord(id) {
    return this.get('store').findRecord('cluster', id)
      .then(cluster => loadClusterRecord(cluster));
  },

  getOnezoneRegistrationToken() {
    const userId = this.get('currentUser.userId');
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: 'user',
        entityId: 'self',
        aspect: 'provider_registration_token',
      }),
      operation: 'create',
      data: { userId },
      subscribe: false,
    });
  },
});
