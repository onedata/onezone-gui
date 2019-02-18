/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @module services/content-resources
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import Service from '@ember/service';
import { Promise } from 'rsvp';

export default Service.extend({
  providerManager: service(),
  clientTokenManager: service(),
  currentUser: service(),
  spaceManager: service(),
  groupManager: service(),
  clusterManager: service(),
  harvesterManager: service(),

  /**
   * @param {string} type plural type of tab, eg. providers
   * @param {string} id record ID
   * @returns {Promise}
   */
  getModelFor(type, id) {
    switch (type) {
      case 'data':
        return this.get('providerManager').getRecord(id);
      case 'clusters':
        return this.get('clusterManager').getRecord(id);
      case 'users':
        return this.get('currentUser').getCurrentUserRecord();
      case 'tokens':
        return this.get('clientTokenManager').getRecord(id);
      case 'spaces':
        return this.get('spaceManager').getRecord(id);
      case 'groups':
        return this.get('groupManager').getRecord(id);
      case 'harvesters':
        return this.get('harvesterManager').getRecord(id);
      default:
        return Promise.reject('No such model type: ' + type);
    }
  },
});
