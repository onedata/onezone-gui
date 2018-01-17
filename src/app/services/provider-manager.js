/**
 * Provides data for routes and components assoctiated with providers tab
 *
 * @module services/provider-manager
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  // TODO to implement using onedata-websocket services

  store: service(),
  currentUser: service(),

  /**
   * Fetches collection of all providers
   * 
   * @return {Promise<DS.RecordArray<Provider>>} resolves to an array of providers
   */
  getProviders() {
    return this.get('currentUser').getCurrentUserRecord().then((user) =>
      user.get('providerList').then((providerList) =>
        providerList.get('list')
      )
    );
  },

  /**
   * Returns provider with specified id
   * @param {string} id
   * @return {Promise<Provider>} provider promise
   */
  getRecord(id) {
    return this.get('store').findRecord('provider', id);
  },
});
