/**
 * Onedata Websocket Sync API - RPC level service
 *
 * @module services/onedata-rpc
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
   * @param {string} methodName
   * @param {string} args
   * @returns {Promise} resolves with method return data
   */
  request(methodName, args = {}) {
    return new Promise((resolve, reject) => {
      let requesting = this.get('onedataWebsocket').sendMessage('rpc', {
        function: methodName,
        args,
      });
      requesting.then(({ payload: { success, data, error } }) => {
        if (success) {
          resolve(data);
        } else {
          reject(error);
        }
      });
      requesting.catch(reject);
    });
  },
});
