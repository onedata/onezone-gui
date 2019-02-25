/**
 * Defines oprations related to harvester management.
 * 
 * @module services/harvester-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { Promise, resolve } from 'rsvp';

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
   * Creates new harvester
   * @returns {Promise<Harvester>}
   */
  createRecord({ name, endpoint }) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => {
        return this.get('store').createRecord('harvester', {
            name,
            endpoint,
            _meta: {
              authHint: ['asUser', get(user, 'entityId')],
            },
          })
          .save()
          .then(harvester => this.reloadList().then(() => harvester));
      });
  },

  /**
   * Reloads harvester list
   * @returns {Promise<HarvesterList>}
   */
  reloadList() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.belongsTo('harvesterList').reload(true));
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
    // const onedataGraph = this.get('onedataGraph');

    // const requestData = {
    //   method,
    //   path,
    //   body,
    // };
    // return onedataGraph.request({
    //   gri: gri({
    //     entityType: 'harvester',
    //     entityId: harvesterId,
    //     aspect: 'query',
    //     scope: 'private',
    //   }),
    //   operation: 'create',
    //   data: requestData,
    //   subscribe: false,
    // });
    return new Promise((resolve, reject) => {
      $.ajax({
        method,
        url: 'http://localhost:9200' + path,
        data: body,
        contentType: 'application/json; charset=UTF-8',
      }).then(resolve, reject);
    });
  },

  /**
   * Gets harvester configuration
   * @param {string} harvesterId
   * @returns {Promise<HarvesterConfiguration>}
   */
  getConfig(harvesterId) {
    const store = this.get('store');
    return store.findRecord('harvesterConfiguration', gri({
      entityType: 'harvester',
      entityId: harvesterId,
      aspect: 'config',
      scope: 'private',
    }));
  },

  /**
   * Returns already loaded harvester by entityId (or undefined if not loaded)
   * @param {string} entityId harvester entityId
   * @returns {Model.Harvester|undefined}
   */
  getLoadedHarvesterByEntityId(entityId) {
    return this.get('store').peekAll('harvester').findBy('entityId', entityId);
  },

  /**
   * Reloads selected list from space identified by entityId.
   * @param {string} entityId space entityId
   * @param {string} listName e.g. `childList`
   * @returns {Promise}
   */
  reloadModelList(entityId, listName) {
    const harvester = this.getLoadedHarvesterByEntityId(entityId);
    return harvester ? harvester.reloadList(listName) : resolve();
  },

  /**
   * Reloads spaceList of harvester identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId harvester entityId
   * @returns {Promise}
   */
  reloadSpaceList(entityId) {
    return this.reloadModelList(entityId, 'spaceList');
  },
});
