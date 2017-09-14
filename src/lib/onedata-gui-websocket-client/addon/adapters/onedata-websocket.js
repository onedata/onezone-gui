/**
 * Uses `service:onedata-graph` for CRUD operations on Onedata model
 *
 * @module adapters/onedata-websocket
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject } from '@ember/service';
import Adapter from 'ember-data/adapter';

import gri from 'onedata-gui-websocket-client/utils/gri';

/**
 * Strips the object from own properties which values are null or undefined
 * Modifies input object.
 * It is not recursive!
 * @param {Object} data
 * @returns {Object} modified data object
 */
function stripObject(data) {
  for (let prop in data) {
    if (data.hasOwnProperty(prop) && data[prop] == null) {
      delete data[prop];
    }
  }
  return data;
}

export default Adapter.extend({
  onedataGraph: inject(),
  onedataGraphContext: inject(),

  defaultSerializer: 'onedata-websocket',

  /**
   * @override
   * @param {DS.Store} store
   * @param {DS.Model} type
   * @param {String} id
   * @param {DS.Snapshot} snapshot
   * @returns {Promise} promise} store
   */
  findRecord(store, type, id, /* snapshot */ ) {
    let {
      onedataGraph,
      onedataGraphContext,
    } = this.getProperties('onedataGraph', 'onedataGraphContext');

    let authHint = onedataGraphContext.getAuthHint(id);

    return onedataGraph.request({
      gri: id,
      operation: 'get',
      authHint,
    }).then(graphData => {
      console.debug(
        `adapter:onedata-websocket: findRecord, gri: ${id}, returned data: `,
        `${JSON.stringify(graphData)}`,
      );
      return graphData;
    });

  },

  /**
   * @override
   * @method createRecord
   * @param {DS.Store} store
   * @param {DS.Model} type
   * @param {DS.Snapshot} snapshot
   * @return {Promise} promise
   */
  createRecord(store, type, snapshot) {
    let onedataGraph = this.get('onedataGraph');
    let data = snapshot.record.toJSON();
    let modelName = type.modelName;

    // support for special metadata for requests in onedata-websocket
    // supported:
    // - authHint: Array.String: 2-element array, eg. ['asUser', <user_id>]
    //   note that user_id is _not_ a gri, but stripped raw id
    let authHint;
    if (snapshot.record._meta) {
      let meta = snapshot.record._meta;
      authHint = meta.authHint;
    }

    stripObject(data);

    return onedataGraph.request({
      // NOTE: adding od_ because it is needed by early versions of server
      gri: gri('od_' + modelName, null, 'instance'),
      operation: 'create',
      data,
      authHint,
    });
  },

  /**
   * @override
   * @method updateRecord
   * @param {DS.Store} store
   * @param {DS.Model} type
   * @param {DS.Snapshot} snapshot
   * @return {Promise} promise
   */
  updateRecord(store, type, snapshot) {
    let onedataGraph = this.get('onedataGraph');
    let data = snapshot.record.toJSON();
    let recordId = snapshot.record.id;
    stripObject(data);
    return onedataGraph.request({
      // NOTE: adding od_ because it is needed by early versions of server
      gri: recordId,
      operation: 'update',
      data,
    });
  },

  /**
   * @override
   * @method deleteRecord
   * @param {DS.Store} store
   * @param {DS.Model} type
   * @param {DS.Snapshot} snapshot
   * @return {Promise} promise
   */
  deleteRecord(store, type, snapshot) {
    let onedataGraph = this.get('onedataGraph');
    let recordId = snapshot.record.id;
    return onedataGraph.request({
      gri: recordId,
      operation: 'delete',
    });
  },

  findAll() {
    throw new Error('adapter:onedata-websocket: findAll is not supported');
  },

  query() {
    throw new Error('adapter:onedata-websocket: query is not supported');
  },
});