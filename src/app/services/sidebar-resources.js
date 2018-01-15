/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as Service, inject } from '@ember/service';

export default Service.extend({
  providerManager: inject(),
  currentUser: inject(),

  /**
   * @param {string} type
   * @returns {PromiseArray}
   */
  getCollectionFor(type) {
    switch (type) {
      case 'providers':
        return this.get('providerManager').getProviders();
      case 'users':
        return this.get('currentUser').getCurrentUserRecord().then(user => {
          return [user];
        });
      default:
        return new Promise((resolve, reject) => reject('No such collection: ' + type));
    }
  },
});
