/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @module services/content-resources
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
   * @param {string} type plural type of tab, eg. providers
   * @param {string} id record ID
   * @returns {Promise}
   */
  getModelFor(type, id) {
    switch (type) {
      case 'providers':
        return this.get('providerManager').getRecord(id);

      default:
        return new Promise((resolve, reject) => reject('No such model type: ' + type));
    }
  },
});
