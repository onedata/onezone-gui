/**
 * Defines oprations related to harvester management.
 * 
 * @module services/harvester-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Service.extend({
  onedataGraph: service(),
  currentUser: service(),
  store: service(),

  /**
   * Fetches collection of all harvesters
   * @returns {Promise<DS.RecordArray<Harvester>>}
   */
  getHarvesters() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('harvesterList'));
  },

  /**
   * Returns harvester with specified id
   * @param {string} id
   * @return {Promise<Harvester>}
   */
  getRecord(id) {
    return this.get('store').findRecord('harvester', id);
  },

  /**
   * Performs request to elasticsearch
   * @param {string} harvesterId
   * @param {string} method
   * @param {string} path
   * @param {any} body
   * @returns {Promise<any>} request result
   */
  esRequest(harvesterId, method, path, body) {
    const onedataGraph = this.get('onedataGraph');

    const requestData = {
      method,
      path,
      body,
    };
    return onedataGraph.request({
      gri: gri({
        entityType: 'harvester',
        entityId: harvesterId,
        aspect: 'query',
        scope: 'private',
      }),
      operation: 'get',
      data: requestData,
      subscribe: false,
    });
  },

  /**
   * Gets harvester configuration
   * @param {string} harvesterId
   * @returns {Promise<Object>}
   */
  getConfig(/* harvesterId */) {
    // FIXME: implement
    throw new Error('getConfig() is not implemented');
  },
});
