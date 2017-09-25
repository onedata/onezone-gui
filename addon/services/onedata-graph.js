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

  /**
   * @param {string} gri
   * @param {string} operation one of: get, update, delete
   * @param {object} data
   * @param {[String,String]} authHint [HintType, Id of subject]
   * @param {string} [subscribe=false]
   * @returns {Promise<object, object>} resolves with Onedata Graph resource
   *   (typically record data)
   */
  request({
    gri,
    operation,
    data,
    authHint,
    subscribe = false,
  }) {
    return new Promise((resolve, reject) => {
      let message = {
        gri,
        operation,
        data,
        subscribe,
      };
      if (authHint) {
        if (Array.isArray(authHint) && authHint.length === 2) {
          message.authHint = authHint.join(':');
        } else {
          throw new Error('service:onedata-graph: invalid authHint');
        }
      }
      let requesting = this.get('onedataWebsocket').sendMessage('graph', message);
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
});
