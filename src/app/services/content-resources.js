/**
 * An abstraction layer for getting data for content of various tabs
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import Service from '@ember/service';
import { resolve, reject } from 'rsvp';

export default Service.extend({
  providerManager: service(),
  tokenManager: service(),
  currentUser: service(),
  spaceManager: service(),
  shareManager: service(),
  groupManager: service(),
  clusterManager: service(),
  harvesterManager: service(),
  uploadManager: service(),
  recordManager: service(),

  /**
   * @param {string} type plural type of tab, eg. providers
   * @param {string} id record ID
   * @returns {Promise}
   */
  getModelFor(type, id) {
    switch (type) {
      case 'providers':
        return this.get('providerManager').getRecord(id);
      case 'clusters':
        // cluster record is ready, when we have domain and name resolved
        return this.get('clusterManager').getRecord(id);
      case 'users':
        return this.get('currentUser').getCurrentUserRecord();
      case 'tokens':
        return this.get('tokenManager').getRecord(id);
      case 'spaces':
        return this.get('spaceManager').getRecord(id);
      case 'shares':
        return this.get('shareManager').getRecord(id);
      case 'groups':
        return this.get('groupManager').getRecord(id);
      case 'harvesters':
        return this.get('harvesterManager').getRecord(id);
      case 'atm-inventories':
        return this.get('recordManager').getRecord('atmInventory', id);
      case 'uploads': {
        const oneprovider = this.get('uploadManager.sidebarOneproviders')
          .findBy('id', id);
        return oneprovider ? resolve(oneprovider) : reject();
      }
      default:
        return reject('No such model type: ' + type);
    }
  },
});
