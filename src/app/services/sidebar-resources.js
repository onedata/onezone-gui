/**
 * An abstraction layer for getting data for sidebar of various tabs
 *
 * @module services/sidebar-resources
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as Service, inject } from '@ember/service';
import { A } from '@ember/array';
import { Promise } from 'rsvp';

export default Service.extend({
  providerManager: inject(),
  clientTokenManager: inject(),
  clientTokenActions: inject(),
  currentUser: inject(),
  spaceManager: inject(),
  spaceActions: inject(),

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
      case 'spaces':
        return this.get('spaceManager').getSpaces();
      case 'users':
        return this.get('currentUser').getCurrentUserRecord().then(user => {
          return Promise.resolve({ list: A([user]) });
        });
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
      case 'spaces':
        return this.get('spaceActions.buttons');
      default:
        return [];
    }
  },
});
