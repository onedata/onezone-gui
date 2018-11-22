/**
 * Provides data for routes and components assoctiated with clusters tab.
 *
 * @module services/cluster-manager
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default Service.extend({
  currentUser: service(),
  store: service(),

  getClusters() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => get(user, 'clusterList'));
  },

  getRecord(id) {
    return this.get('store').findRecord('cluster', id);
  },
});
