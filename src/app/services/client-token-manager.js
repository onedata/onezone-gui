/**
 * Provides data for routes and components assoctiated with tokens tab.
 *
 * @module services/client-token-manager
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';

const ClientTokenManager = Service.extend({
  store: service(),
  currentUser: service(),
  onedataGraph: service(),

  /**
   * Fetches collection of all tokens
   * 
   * @return {Promise<DS.RecordArray<ClientToken>>} resolves to an array of tokens
   */
  getClientTokens() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('clientTokenList'));
  },

  /**
   * Returns token with specified id
   * @param {string} id
   * @return {Promise<ClientToken>} token promise
   */
  getRecord(id) {
    return this.getClientTokens()
      .then(listRecord => get(listRecord, 'list'))
      .then(list => list.find(t => id == get(t, 'id')));
  },

  /**
   * Creates new token
   * @returns {Promise<ClientToken>}
   */
  createRecord() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => {
        const userId = get(user, 'entityId');
        const tokenCreateGri = gri({
          entityType: 'user',
          entityId: userId,
          aspect: 'client_tokens',
          scope: 'private',
        });
        return this.get('onedataGraph')
          .request({
            gri: tokenCreateGri,
            operation: 'create',
            data: {},
          })
          .then(tokenData => {
            const tokenGri = tokenData.gri;
            return user.belongsTo('clientTokenList').reload()
              .then(() =>
                this.get('store').findRecord('clientToken', tokenGri)
              );
          });
      });
  },

  /**
   * Deletes token
   * @param {string} id token id
   * @returns {Promise}
   */
  deleteRecord(id) {
    return this.getRecord(id)
      .then(token => token.destroyRecord()
        .then(destroyResult => {
          this.get('currentUser')
            .getCurrentUserRecord()
            .then(user => user.belongsTo('clientTokenList').reload())
            .then(() => destroyResult);
        })
      );
  },
});

export default ClientTokenManager;
