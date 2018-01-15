/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  providerManager: service(),
  clientTokenManager: service(),
  clientTokenActions: service(),

  /**
   * @param {string} type
   * @returns {PromiseArray}
   */
  getCollectionFor(type) {
    switch (type) {
      case 'providers':
        return this.get('providerManager').getProviders();
      case 'tokens':
        return this.get('clientTokenManager').getClientTokens();
      case 'users':
        return Promise.reject({ message: 'User management not implemented yet' });
      default:
        return new Promise((resolve, reject) => reject('No such collection: ' + type));
    }
  },

  /**
   * Returns sidebar buttons definitions
   * @param {string} type
   * @returns {Array<object>}
   */
  getButtonsFor(type) {
    switch (type) {
      case 'tokens':
        return this.get('clientTokenActions.actionButtons');
      default:
        return [];
    }
  },
});
