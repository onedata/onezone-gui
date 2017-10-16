/**
 * Provides data for routes and components assoctiated with providers tab
 *
 * @module services/provider-manager
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  Service,
  inject: { service },
} = Ember;

export default Service.extend({
  // TODO to implement using onedata-websocket services

  store: service(),
  currentUser: service(),

  /**
   * Fetch collection of onepanel ClusterStorage
   * 
   * @param {string} id
   * @return {PromiseArray.EmberObject} resolves ArrayProxy of SpaceDetails promise proxies
   */
  getProviders() {
    return this.get('currentUser').getCurrentUserRecord().then((user) =>
      user.get('providerList').then((providerList) =>
        providerList.get('list')
      )
    );
  },

  /**
   * @param {string} id
   * @return {ObjectPromiseProxy} resolves ClusterStorage ObjectProxy
   */
  getRecord(id) {
    return this.get('store').findRecord('provider', id);
  },

});
