/**
 * Provides data for routes and components assoctiated with tokens tab.
 *
 * @module services/client-token-manager
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject } from '@ember/service';
import addRecordToList from 'onedata-gui-websocket-client/utils/add-record-to-list';

export default Service.extend({
  // TODO to implement using onedata-websocket services

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
    return this.get('currentUser').getCurrentUserRecord().then((user) =>
      user.get('clientTokenList').then((clientTokenList) =>
        addRecordToList(token, clientTokenList)
      )
    );
  },

  /**
   * Deletes token
   * @param {string} id token id
   * @returns {Promise}
   */
  deleteRecord(id) {
    return this.getRecord(id).then((token) => 
      this.get('currentUser').getCurrentUserRecord().then((user) =>
        user.get('clientTokenList').then((clientTokenList) =>
          clientTokenList.get('list').then((list) =>
            list.removeObject(token).save().then(() =>
              clientTokenList.save().then(() =>
                token.destroyRecord()
              )
            )
          )
        )
      )
    );
  },
});
