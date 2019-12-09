/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { resolve, reject } from 'rsvp';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';

export default SidebarResources.extend({
  providerManager: service(),
  tokenManager: service(),
  tokenActions: service(),
  currentUser: service(),
  spaceManager: service(),
  clusterActions: service(),
  spaceActions: service(),
  groupManager: service(),
  groupActions: service(),
  clusterManager: service(),
  harvesterManager: service(),
  harvesterActions: service(),
  uploadManager: service(),

  /**
   * @param {string} type
   * @returns {GraphListModel}
   */
  getCollectionFor(type) {
    switch (type) {
      case 'providers':
        return this.get('providerManager').getProviders();
      case 'clusters':
        return this.get('clusterManager').getClusters();
      case 'tokens':
        return this.get('tokenManager').getTokens();
      case 'spaces':
        return this.get('spaceManager').getSpaces();
      case 'groups':
        return this.get('groupManager').getGroups();
      case 'harvesters':
        return this.get('harvesterManager').getHarvesters();
      case 'uploads':
        return resolve({
          list: this.get('uploadManager.sidebarOneproviders'),
        });
      case 'users':
        return this.get('currentUser').getCurrentUserRecord().then(user => {
          return resolve({ list: A([user]) });
        });
      default:
        return reject('No such collection: ' + type);
    }
  },

  /**
   * Returns sidebar buttons definitions
   * @param {string} type
   * @returns {Array<object>}
   */
  getButtonsFor(type) {
    switch (type) {
      case 'clusters':
        return this.get('clusterActions.buttons');
      case 'tokens':
        return this.get('tokenActions.actionButtons');
      case 'spaces':
        return this.get('spaceActions.buttons');
      case 'groups':
        return this.get('groupActions.buttons');
      case 'harvesters':
        return this.get('harvesterActions.buttons');
      default:
        return [];
    }
  },

  /**
   * @override
   */
  getItemsSortingFor(resourceType) {
    if (resourceType === 'tokens') {
      return ['isActive:desc', 'name'];
    } else if (resourceType === 'uploads') {
      return ['isAllOneproviders:desc', 'name'];
    } else {
      return this._super(...arguments);
    }
  },
});
