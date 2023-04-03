/**
 * Provides data for routes and components associated with providers tab
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
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
   * @returns {Promise<DS.RecordArray<Provider>>} resolves to an array of providers
   */
  getProviders() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('providerList'))
      .then(providerList => get(providerList, 'list')
        .then(() => providerList)
      );
  },

  getProviderById(providerId, scope = 'protected') {
    const providerGri = gri({
      entityType: 'provider',
      entityId: providerId,
      aspect: 'instance',
      scope,
    });
    return this.getRecord('provider', providerGri);
  },

  /**
   * Returns provider with specified id
   * @param {string} id
   * @returns {Promise<Provider>} provider promise
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
