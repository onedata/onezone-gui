/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import { resolve, reject } from 'rsvp';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';
import ArrayProxy from '@ember/array/proxy';

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
          list: ArrayProxy.create({
            content: this.get('uploadManager.sidebarOneproviders'),
          }),
        });
      case 'users':
        return this.get('currentUser').getCurrentUserRecord().then(user => {
          return resolve({ list: ArrayProxy.create({ content: [user] }) });
        });
      default:
        return reject('No such collection: ' + type);
    }
  },

  /**
   * @override
   */
  getButtonsFor(type, context) {
    const actionsSource = {
      'clusters': this.clusterActions,
      'tokens': this.tokenActions,
      'spaces': this.spaceActions,
      'groups': this.groupActions,
      'harvesters': this.harvesterActions,
      'atm-inventories': this.workflowActions,
    } [type];
    return actionsSource?.createGlobalActions(context) ?? [];
  },

  /**
   * @override
   */
  getItemsSortingFor(resourceType) {
    switch (resourceType) {
      case 'tokens':
        return ['isActive:desc', 'isObsolete', 'name'];
      case 'uploads':
        return ['isAllOneproviders:desc', 'name'];
      case 'shares':
        return ['hasHandle:desc', 'name'];
      default:
        return this._super(...arguments);
    }
  },
});
