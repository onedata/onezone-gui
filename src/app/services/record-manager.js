/**
 * Has generic functions to manage records and relations.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2020-2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { dasherize, camelize } from '@ember/string';
import { resolve, all as allFulfilled } from 'rsvp';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import RecordManagerConfiguration from 'onezone-gui/utils/record-manager-configuration';

export default Service.extend({
  currentUser: service(),
  store: service(),
  onedataGraphUtils: service(),

  /**
   * @type {Utils.RecordManagerConfiguration}
   */
  configuration: undefined,

  init() {
    this._super(...arguments);

    if (!this.get('configuration')) {
      this.set('configuration', new RecordManagerConfiguration(this));
    }
  },

  /**
   * Returns loaded *List relation of current user
   * @param {String} listItemModelName
   * @returns {Promise<GraphListModel>}
   */
  getUserRecordList(listItemModelName) {
    const user = this.getCurrentUserRecord();
    const listRelationName = `${camelize(listItemModelName)}List`;
    return user.getRelation(listRelationName)
      .then(recordList => get(recordList, 'list').then(list =>
        allFulfilled(list.map(record => this.loadRequiredRelationsOfRecord(record)))
        .then(() => recordList)
      ));
  },

  /**
   * Reloads *List relations of current user containing specified model. Only already
   * loaded lists will be reloaded
   * @param {String} listItemModelName
   * @returns {Promise}
   */
  reloadUserRecordList(listItemModelName) {
    return this.reloadRecordList(this.getCurrentUserRecord(), listItemModelName);
  },

  /**
   * Reloads *List relations of record specified by listOwnerModelName and recordId.
   * Only already loaded lists containing specified model will be reloaded
   * @param {String} listOwnerModelName
   * @param {String} recordId
   * @param {String} listItemModelName
   * @returns {Promise}
   */
  reloadRecordListById(listOwnerModelName, recordId, listItemModelName) {
    const record = this.getLoadedRecordById(listOwnerModelName, recordId);
    return record ? this.reloadRecordList(record, listItemModelName) : resolve();
  },

  /**
   * Reloads *List relations of all record specified by listOwnerModelName. Only already
   * loaded lists containing specified model will be reloaded
   * @param {String} listOwnerModelName
   * @param {String} listItemModelName
   * @returns {Promise}
   */
  reloadRecordListInAllRecords(listOwnerModelName, listItemModelName) {
    const allRecords = this.getAllLoadedRecords(listOwnerModelName);
    return allFulfilled(
      allRecords.map(record => this.reloadRecordList(record, listItemModelName))
    ).catch(ignoreForbiddenError);
  },

  /**
   * Reloads *List relations of given record. Only already loaded lists containing
   * specified model will be reloaded
   * @param {GraphSingleModel} record
   * @param {String} listItemModelName
   * @returns {Promise}
   */
  reloadRecordList(record, listItemModelName) {
    const store = this.get('store');
    const modelClass = record.constructor;
    const listItemEmberModelName =
      this.emberifyModelName(listItemModelName);

    const relationsToReload = get(modelClass, 'relationshipNames.belongsTo')
      .filter(relationName => {
        if (!relationName.endsWith('List')) {
          return false;
        }
        const listModelName =
          get(modelClass, 'relationshipsByName').get(relationName).type;
        const listModelClass = store.modelFor(listModelName);
        const listHasManyRelation =
          get(listModelClass, 'relationshipsByName').get('list');
        return listHasManyRelation &&
          listHasManyRelation.type === listItemEmberModelName;
      });

    return allFulfilled(
      relationsToReload.map(relationName => record.reloadList(relationName))
    );
  },

  /**
   * Reloads specified record if it has been already loaded.
   * @param {String} modelName
   * @param {String} recordId
   * @returns {Promise<GraphSingleModel|null>}
   */
  async reloadRecordById(modelName, recordId) {
    const loadedRecord = this.getLoadedRecordById(modelName, recordId);
    if (!loadedRecord) {
      return null;
    }
    return await loadedRecord.reload();
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
   * @param {boolean} [backgroundReload=false]
   * @returns {Promise<GraphModel>}
   */
  getRecord(modelName, gri, backgroundReload = false) {
    return this.get('store')
      .findRecord(modelName, gri, { backgroundReload })
      .then(record => this.loadRequiredRelationsOfRecord(record).then(() => record));
  },

  /**
   * Loads record by modelName and recordId
   * @param {String} modelName
   * @param {String} recordId
   * @param {boolean} [backgroundReload=false]
   * @returns {Promise<GraphModel>}
   */
  getRecordById(modelName, recordId, backgroundReload = false) {
    const recordGri = gri({
      entityType: this.getEntityTypeForModelName(modelName),
      entityId: recordId,
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
   * @returns {Promise<GraphSingleModel|null>}
   */
  getLoadedRecordById(modelName, recordId) {
    return this.getAllLoadedRecords(modelName).findBy('entityId', recordId) || null;
  },

  /**
   * Returns an array with all records of the passed type
   * @param {String} modelName
   * @returns {Array<GraphSingleModel>}
   */
  getAllLoadedRecords(modelName) {
    return this.get('store').peekAll(modelName);
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

  /**
   * Adds new owner the the record
   * @param {GraphSingleModel} recordBeingOwned
   * @param {Models.User} ownerRecord
   * @returns {Promise}
   */
  addOwnerToRecord(recordBeingOwned, ownerRecord) {
    return this.addOwnerToRecordById(
      this.getModelNameForRecord(recordBeingOwned),
      get(recordBeingOwned, 'entityId'),
      get(ownerRecord, 'entityId')
    );
  },

  /**
   * Adds new owner the the record
   * @param {String} modelBeingOwnedName
   * @param {String} recordBeingOwnedId
   * @param {String} ownerRecordId
   * @returns {Promise}
   */
  addOwnerToRecordById(modelBeingOwnedName, recordBeingOwnedId, ownerRecordId) {
    return this.get('onedataGraphUtils').addOwner(
      this.getEntityTypeForModelName(modelBeingOwnedName),
      recordBeingOwnedId,
      ownerRecordId
    ).then(() =>
      this.reloadRecordListById(modelBeingOwnedName, recordBeingOwnedId, 'user')
      .catch(ignoreForbiddenError)
    );
  },

  /**
   * Removes an owner from the record
   * @param {GraphSingleModel} recordBeingOwned
   * @param {Models.User} ownerRecord
   * @returns {Promise}
   */
  removeOwnerFromRecord(recordBeingOwned, ownerRecord) {
    return this.removeOwnerFromRecordById(
      this.getModelNameForRecord(recordBeingOwned),
      get(recordBeingOwned, 'entityId'),
      get(ownerRecord, 'entityId')
    );
  },

  /**
   * Removes an owner from the record
   * @param {String} modelBeingOwnedName
   * @param {String} recordBeingOwnedId
   * @param {String} ownerRecordId
   * @returns {Promise}
   */
  removeOwnerFromRecordById(modelBeingOwnedName, recordBeingOwnedId, ownerRecordId) {
    return this.get('onedataGraphUtils').removeOwner(
      this.getEntityTypeForModelName(modelBeingOwnedName),
      recordBeingOwnedId,
      ownerRecordId
    ).then(() =>
      this.reloadRecordListById(modelBeingOwnedName, recordBeingOwnedId, 'user')
      .catch(ignoreForbiddenError)
    );
  },

  /**
   * Removes passed record
   * @param {GraphSingleModel} record
   */
  async removeRecord(record) {
    if (get(record, 'isDeleted')) {
      return;
    }

    await record.destroyRecord();
    await this.get('configuration').onRecordRemove(
      this.getModelNameForRecord(record),
      record
    );
  },

  /**
   * Removes record by modelName and recordId
   * @param {String} modelName
   * @param {String} recordId
   * @returns {Promise}
   */
  removeRecordById(modelName, recordId) {
    return resolve(this.getLoadedRecordById(modelName, recordId))
      .then(record => record || this.getRecordById(modelName, recordId))
      .then(record => this.removeRecord(record));
  },

  /**
   * Returns entity type for given model name
   * @param {String} modelName
   * @returns {String}
   */
  getEntityTypeForModelName(modelName) {
    // Get application adapter. It's not important for which model it is
    return this.get('store').adapterFor('user')
      .getEntityTypeForModelName(this.emberifyModelName(modelName));
  },

  /**
   * Returns model name that can be safely used with Ember Data methods.
   * @param {String} modelName
   * @returns {String}
   */
  emberifyModelName(modelName) {
    return dasherize(modelName);
  },

  /**
   * Returns model name for passed record.
   * @param {GraphSingleModel} record
   * @returns {String}
   */
  getModelNameForRecord(record) {
    return camelize(get(record, 'constructor.modelName'));
  },

  /**
   * Removes relation between current user and given record.
   * @param {GraphSingleModel} relationTargetRecord
   * @param {String|undefined} [relationType=undefined]
   *   one of `'parent'`, `'child'` or undefined (default). Values other than
   *   `undefined` are not handled yet. TODO: VFS-6243
   */
  async removeUserRelation(
    relationTargetRecord,
    relationType = undefined
  ) {
    const currentUser = this.getCurrentUserRecord();
    await this.removeRelation(
      currentUser,
      relationTargetRecord,
      relationType
    );
  },

  /**
   * Removes relation between current user and given record.
   * @param {String} relationTargetModelName
   * @param {String} relationTargetRecordId
   * @param {String|undefined} [relationType=undefined]
   *   one of `'parent'`, `'child'` or undefined (default). Values other than
   *   `undefined` are not handled yet. TODO: VFS-6243
   */
  async removeUserRelationById(
    relationTargetModelName,
    relationTargetRecordId,
    relationType = undefined
  ) {
    const currentUser = this.getCurrentUserRecord();
    await this.removeRelationById(
      this.getModelNameForRecord(currentUser),
      get(currentUser, 'entityId'),
      relationTargetModelName,
      relationTargetRecordId,
      relationType
    );
  },

  /**
   * Removes relation between two records.
   * @param {GraphSingleModel} relationOriginRecord
   * @param {GraphSingleModel} relationTargetRecord
   * @param {String|undefined} [relationType=undefined]
   *   one of `'parent'`, `'child'` or undefined (default). Values other than
   *   `undefined` are not handled yet. TODO: VFS-6243
   */
  async removeRelation(
    relationOriginRecord,
    relationTargetRecord,
    relationType = undefined
  ) {
    await this.removeRelationById(
      this.getModelNameForRecord(relationOriginRecord),
      get(relationOriginRecord, 'entityId'),
      this.getModelNameForRecord(relationTargetRecord),
      get(relationTargetRecord, 'entityId'),
      relationType
    );
  },

  /**
   * Removes relation between two records.
   * @param {String} relationOriginModelName
   * @param {String} relationOriginRecordId
   * @param {String} relationTargetModelName
   * @param {String} relationTargetRecordId
   * @param {String|undefined} [relationType=undefined]
   *   one of `'parent'`, `'child'` or undefined (default). Values other than
   *   `undefined` are not handled yet. TODO: VFS-6243
   */
  async removeRelationById(
    relationOriginModelName,
    relationOriginRecordId,
    relationTargetModelName,
    relationTargetRecordId,
    relationType = undefined
  ) {
    const {
      configuration,
      onedataGraphUtils,
    } = this.getProperties('configuration', 'onedataGraphUtils');

    const removeRelationPossibilities =
      await configuration.getRemoveRelationPossibilities(
        relationOriginModelName,
        relationOriginRecordId,
        relationTargetModelName,
        relationTargetRecordId,
        relationType
      );

    if (!removeRelationPossibilities.length) {
      throw { id: 'forbidden' };
    }

    const errors = [];
    // Try to remove relation using calculated possibilities one after another
    // until some of them will work
    for (const removeRelationPossibility of removeRelationPossibilities) {
      try {
        await onedataGraphUtils.leaveRelation(
          removeRelationPossibility.entityType,
          removeRelationPossibility.entityId,
          removeRelationPossibility.aspect,
          removeRelationPossibility.aspectId,
        );
        // Loop should break when the request was successfull
        break;
      } catch (error) {
        errors.push(error);
      }
    }

    // All requests failed
    if (errors.length >= removeRelationPossibilities.length) {
      const meaningfulErrors = errors.compact().rejectBy('id', 'forbidden');
      meaningfulErrors.slice(1).forEach(error => console.error(
        'service:record-manager.removeRelation:',
        error
      ));

      throw (meaningfulErrors[0] || { id: 'forbidden' });
    }

    await configuration.onRelationRemove(
      relationOriginModelName,
      relationOriginRecordId,
      relationTargetModelName,
      relationTargetRecordId,
      relationType
    );
  },
});
