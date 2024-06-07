/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
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
  shareManager: service(),
  clusterActions: service(),
  spaceActions: service(),
  groupManager: service(),
  groupActions: service(),
  clusterManager: service(),
  harvesterManager: service(),
  harvesterActions: service(),
  uploadManager: service(),
  recordManager: service(),
  workflowActions: service(),

  /**
   * @override
   */
  modelNameToRouteResourceTypeMapping: Object.freeze(new Map([
    ['atmInventory', 'atm-inventories'],
  ])),

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
      case 'shares':
        return this.get('shareManager').getVirtualAllSharesList().reload();
      case 'groups':
        return this.get('groupManager').getGroups();
      case 'harvesters':
        return this.get('harvesterManager').getHarvesters();
      case 'atm-inventories':
        return this.get('recordManager').getUserRecordList('atmInventory');
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
   * @override
   */
  getButtonsFor(type, context) {
    switch (type) {
      case 'clusters':
        return this.get('clusterActions.buttons');
      case 'tokens':
        return this.get('tokenActions').createGlobalActions(context);
      case 'spaces':
        return this.get('spaceActions.buttons');
      case 'groups':
        return this.get('groupActions.buttons');
      case 'harvesters':
        return this.get('harvesterActions.buttons');
      case 'atm-inventories':
        return this.get('workflowActions').createGlobalActions(context);
      default:
        return [];
    }
  },

  /**
   * @override
   */
  getItemsSortingFor(resourceType) {
    if (resourceType === 'tokens') {
      return ['isActive:desc', 'isObsolete', 'name'];
    } else if (resourceType === 'uploads') {
      return ['isAllOneproviders:desc', 'name'];
    } else {
      return this._super(...arguments);
    }
  },
});
