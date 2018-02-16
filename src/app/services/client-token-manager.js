/**
 * Provides data for routes and components assoctiated with tokens tab.
 *
 * @module services/client-token-manager
 * @author Michal Borzecki, Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject } from '@ember/service';
import addRecordToList from 'onedata-gui-websocket-client/utils/add-record-to-list';
import removeRecordFromList from 'onedata-gui-websocket-client/utils/remove-record-from-list';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';

// TODO: needed for temporary hack
import config from 'ember-get-config';
import { isDevelopment } from 'onedata-gui-websocket-client/utils/development-environment';

const ClientTokenManager = Service.extend({
  store: inject(),
  currentUser: inject(),

  /**
   * Fetches collection of all tokens
   * 
   * @return {Promise<DS.RecordArray<ClientToken>>} resolves to an array of tokens
   */
  getClientTokens() {
    return this.get('currentUser').getCurrentUserRecord().then((user) =>
      user.get('clientTokenList').then((clientTokenList) =>
        clientTokenList.get('list')
      )
    );
  },

  /**
   * Returns token with specified id
   * @param {string} id
   * @return {Promise<ClientToken>} token promise
   */
  getRecord(id) {
    return this.get('store').findRecord('clientToken', id);
  },

  /**
   * Creates new token
   * @returns {Promise<ClientToken>}
   */
  createRecord() {
    const token = this.get('store').createRecord('clientToken', {});
    return token.save();
    // return this.get('currentUser').getCurrentUserRecord().then((user) =>
    //   user.get('clientTokenList').then((clientTokenList) =>
    //     addRecordToList(token, clientTokenList)
    //   )
    // );
  },

  /**
   * Deletes token
   * @param {string} id token id
   * @returns {Promise}
   */
  deleteRecord(id) {
    return this.getRecord(id)
      .then(token => token.destroyRecord());
    // FIXME: then reload tokens list

    // return this.getRecord(id).then((token) =>
    //   this.get('currentUser').getCurrentUserRecord().then((user) =>
    //     user.get('clientTokenList').then((clientTokenList) =>
    //       removeRecordFromList(token, clientTokenList)
    //     )
    //   )
    // );
  },
});

// TODO: a temporary hack to enable creating tokens in current backend
if (!isDevelopment(config)) {
  ClientTokenManager.reopen({
    onedataGraph: inject(),
    /**
     * @override
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
              return user.get('clientTokenList')
                .then(clientTokenList => clientTokenList.reload(true))
                .then(() => this.get('store').findRecord('clientToken', tokenGri));
            });
        });
    },

    getTokenList() {
      return this.get('currentUser').getCurrentUserRecord()
        .then(user => user.get('clientTokenList'));
    },
  });
}

export default ClientTokenManager;
