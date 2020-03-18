/**
 * Provides data for routes and components associated with providers tab
 *
 * @module services/provider-manager
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as providerEntityType } from 'onezone-gui/models/provider';

export default Service.extend({
  store: service(),
  currentUser: service(),

  /**
   * Fetches collection of all providers
   * 
   * @return {Promise<DS.RecordArray<Provider>>} resolves to an array of providers
   */
  getProviders() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('providerList'))
      .then(providerList => get(providerList, 'list')
        .then(() => providerList)
      );
  },

  /**
   * Returns provider with specified id
   * @param {string} id
   * @return {Promise<Provider>} provider promise
   */
  getRecord(id) {
    return this.get('store').findRecord('provider', id);
  },

  getRecordById(entityId) {
    const recordGri = gri({
      entityType: providerEntityType,
      entityId: entityId,
      aspect: 'instance',
      scope: 'auto',
    });
    return this.getRecord(recordGri);
  },

  /**
   * Reloads providers list
   * @returns {Promise<ProviderList>}
   */
  reloadList() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.belongsTo('providerList').reload(true));
  },
});
