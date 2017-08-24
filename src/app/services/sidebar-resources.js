/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  RSVP: {
    Promise,
  },
  inject: {
    service,
  },
} = Ember;

export default Ember.Service.extend({
  providerManager: service(),

  /**
   * @param {string} type
   * @returns {Promise}
   */
  getCollectionFor(type) {
    switch (type) {
      case 'providers':
        return this.get('providerManager').getProviders();
      case 'users':
        return Promise.reject({ message: 'User management not implemented yet' });
      default:
        return new Promise((resolve, reject) => reject('No such collection: ' + type));
    }
  },
});
