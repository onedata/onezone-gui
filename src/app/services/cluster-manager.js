/**
 * Provides data for routes and components assoctiated with clusters tab.
 *
 * @module services/cluster-manager
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { resolve } from 'rsvp';

export default Service.extend({
  currentUser: service(),

  getClusters() {
    return this.get('currentUser').getCurrentUserRecord()
      .get('clusterList');
  },

  // FIXME: backend model
  mockgetClusters() {
    return resolve({
      list: [{
          id: 'mock-cluster-zone-id',
          name: 'PL-Grid',
          hostname: 'onedata.plgrid.pl',
          onepanelProxy: true,
        },
        {
          id: 'mock-cluster-p-cyfronet-id',
          name: 'Cyfronet',
          hostname: 'oneprovider.cyfronet.pl',
          onepanelProxy: false,
        },
        {
          id: 'mock-cluster-p-pcss-id',
          name: 'PCSS',
          hostname: 'oneprovider.pcss.pl',
          onepanelProxy: true,
        },
      ],
    });
  },
});
