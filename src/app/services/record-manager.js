/**
 * Has generic functions to get and reload records and relations.
 *
 * @module services/record-manager
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { resolve, all as allFulfilled } from 'rsvp';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Service.extend({
  currentUser: service(),
  store: service(),

  /**
   * Returns loaded *List relation of current user
   * @param {String} modelNameInList
   * @returns {Promise<GraphListModel>}
   */
  getUserRecordList(modelNameInList) {
    const user = this.getCurrentUserRecord();
    const listRelationName = `${modelNameInList}List`;
    return user.getRelation(listRelationName)
      .then(recordList => get(recordList, 'list').then(list =>
        allFulfilled(list.map(record => this.loadRequiredRelationsOfRecord(record)))
        .then(() => recordList)
      ));
  },

  /**
   * Reloads *List relations of current user containing specified model. Only already
   * loaded lists will be reloaded
   * @param {String} modelNameInList 
   * @returns {Promise}
   */
  reloadUserRecordList(modelNameInList) {
    return this.reloadRecordList(this.getCurrentUserRecord(), modelNameInList);
  },

  /**
   * Reloads *List relations of record specified by modelName and recordId. Only already
   * loaded lists containing specified model will be reloaded
   * @param {String} modelName 
   * @param {String} recordId
   * @param {String} modelNameInList
   * @returns {Promise}
   */
  reloadRecordListById(modelName, recordId, modelNameInList) {
    const record = this.getLoadedRecordById(modelName, recordId);
    return record ? this.reloadRecordList(record, modelNameInList) : resolve();
  },

  /**
   * Reloads *List relations of given record. Only already loaded lists containing
   * specified model will be reloaded
   * @param {GraphSingleModel} record
   * @param {String} modelNameInList
   * @returns {Promise}
   */
  reloadRecordList(record, modelNameInList) {
    const store = this.get('store');
    const modelClass = record.constructor;

    const relationsToReload = get(modelClass, 'relationshipNames.belongsTo')
      .filter(relationName => {
        if (!relationName.endsWith('List')) {
          return false;
        }
        const listModelName =
          get(modelClass, 'relationshipsByName').get(relationName).type;
        const listModelClass = store.modelFor(listModelName);
        const listHasManyRelation = get(listModelClass, 'relationshipsByName').get('list');
        return listHasManyRelation && listHasManyRelation.type === modelNameInList;
      });

    return allFulfilled(
      relationsToReload.map(relationName => record.reloadList(relationName))
    );
  },

  /**
   * Returns current user record
   * @returns {Models.User}
   */
  getCurrentUserRecord() {
    return this.get('currentUser.userProxy.content');
  },

  /**
   * Loads record by modelName and gri
   * @param {String} modelName
   * @param {String} gri
   * @param {boolean} [backgroundReload=true]
   * @returns {Promise<GraphModel>}
   */
  getRecord(modelName, gri, backgroundReload = true) {
    return this.get('store').findRecord(modelName, gri, { backgroundReload })
      .then(record => this.loadRequiredRelationsOfRecord(record).then(() => record));
  },

  /**
   * Loads record by modelName and gri
   * @param {String} modelName
   * @param {String} id
   * @param {boolean} [backgroundReload=true]
   * @returns {Promise<GraphModel>}
   */
  getRecordById(modelName, id, backgroundReload = true) {
    const store = this.get('store');
    // Get application adapter. It's not important for which model it is
    const entityType = store.adapterFor('user').getEntityTypeForModelName(modelName);

    const recordGri = gri({
      entityType,
      entityId: id,
      aspect: 'instance',
      scope: 'auto',
    });

    return this.getRecord(modelName, recordGri, backgroundReload);
  },

  /**
   * Returns record specified by modelName and recordId. Will return record only if it was
   * loaded earlier.
   * @param {String} modelName 
   * @param {String} recordId
   * @returns {Models.User}
   */
  getLoadedRecordById(modelName, recordId) {
    return this.get('store').peekAll(modelName).findBy('entityId', recordId);
  },

  /**
   * Loads all relations essential for given record (so should be considered as a part of
   * the record loading process).
   * @param {GraphSingleModel} record 
   * @returns {Promise}
   */
  loadRequiredRelationsOfRecord(record) {
    return record.loadRequiredRelations ? record.loadRequiredRelations() : resolve();
  },
});
