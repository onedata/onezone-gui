/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject } from '@ember/service';
import { A } from '@ember/array';
import { resolve, reject } from 'rsvp';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';

export default SidebarResources.extend({
  providerManager: inject(),
  tokenManager: inject(),
  tokenActions: inject(),
  currentUser: inject(),
  spaceManager: inject(),
  clusterActions: inject(),
  spaceActions: inject(),
  groupManager: inject(),
  groupActions: inject(),
  clusterManager: inject(),
  harvesterManager: inject(),
  harvesterActions: inject(),

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
  getItemsSortingFor(type) {
    if (type === 'tokens') {
      return ['isActive:desc', 'name'];
    } else {
      return this._super(...arguments);
    }
  },
});
