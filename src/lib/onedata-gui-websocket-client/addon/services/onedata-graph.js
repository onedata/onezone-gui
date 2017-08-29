/**
 * Onedata Websocket Sync API - Graph level service
 *
 * @module services/onedata-graph
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';

const {
  Service,
  inject: { service },
  RSVP: { Promise },
} = Ember;

export default Service.extend({
  onedataWebsocket: service(),

  // FIXME handle rejects from socket level

  /**
   * 
   * @param {string} entityType 
   * @param {string} entityId 
   * @param {string} aspect 
   * @param {string} operation one of: get, update, delete
   * @param {string} scope 
   */
  request({
    entityType,
    entityId,
    aspect,
    operation,
    data,
    scope = 'private',
    subscribe = false,
  }) {
    let gri = this._gri(entityType, entityId, aspect, scope);
    return new Promise((resolve, reject) => {
      let requesting = this.get('onedataWebsocket').send('graph', {
        gri,
        operation,
        data,
        subscribe,
      });
      requesting.then(({ payload: { success, data: payloadData, error } }) => {
        if (success) {
          resolve(payloadData);
        } else {
          reject(error);
        }
      });
      requesting.catch(reject);
    });
  },

  // CRUD - to move!

  getRecord(entityType, entityId) {
    return this.request({
      entityType,
      entityId,
      aspect: 'data',
      operation: 'get',
    });
  },

  _gri(entityType, entityId, aspect, scope) {
    return `${entityType}.${entityId || 'null'}.${aspect}${scope && ':' + scope}`;
  },
});
