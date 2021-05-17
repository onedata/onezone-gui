/**
 * Performs backend operations related to workflows.
 *
 * @module services/workflow-manager
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as atmInventoryEntityType } from 'onezone-gui/models/atm-inventory';
import { all as allFulfilled, resolve } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';

export default Service.extend({
  store: service(),
  recordManager: service(),
  onedataGraph: service(),
  onedataGraphUtils: service(),

  /**
   * Creates new automation inventory.
   * @param {Object} rawAtmInventory
   * @returns {Promise<Models.AtmInventory>}
   */
  createAtmInventory(rawAtmInventory) {
    const {
      recordManager,
      store,
    } = this.getProperties('recordManager', 'store');
    const currentUserId = get(recordManager.getCurrentUserRecord(), 'entityId');
    return store.createRecord(
      'atmInventory',
      Object.assign({}, rawAtmInventory, {
        _meta: {
          authHint: ['asUser', currentUserId],
        },
      })
    ).save().then(atmInventory =>
      recordManager.reloadUserRecordList('atmInventory').then(() => atmInventory)
    );
  },

  /**
   * Joins current user to a automation inventory without token
   * @param {String} atmInventoryId
   * @returns {Promise}
   */
  joinAtmInventoryAsUser(atmInventoryId) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');
    const currentUser = recordManager.getCurrentUserRecord();
    const loadedAtmInventory = recordManager.getLoadedRecordById(
      'atmInventory',
      atmInventoryId
    );

    return onedataGraph.request({
      gri: gri({
        entityType: atmInventoryEntityType,
        entityId: atmInventoryId,
        aspect: 'user',
        aspectId: get(currentUser, 'entityId'),
        scope: 'private',
      }),
      operation: 'create',
      subscribe: false,
    }).then(() => allFulfilled([
      loadedAtmInventory ? loadedAtmInventory.reload() : resolve(),
      recordManager.reloadRecordListById(
        'atmInventory',
        atmInventoryId,
        'user'
      ).catch(ignoreForbiddenError),
    ]));
  },

  /**
   * Creates member group for specified automation inventory
   * @param {String} atmInventoryId
   * @param {Object} groupRepresentation
   * @return {Promise}
   */
  createMemberGroupForAtmInventory(atmInventoryId, groupRepresentation) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');
    const currentUser = recordManager.getCurrentUserRecord();

    return onedataGraph.request({
      gri: gri({
        entityType: atmInventoryEntityType,
        entityId: atmInventoryId,
        aspect: 'group',
        scope: 'auto',
      }),
      operation: 'create',
      data: groupRepresentation,
      authHint: ['asUser', get(currentUser, 'entityId')],
    }).then(() => {
      return allFulfilled([
        recordManager.reloadRecordListById(
          'atmInventory',
          atmInventoryId,
          'group'
        ).catch(ignoreForbiddenError),
        recordManager.reloadUserRecordList('atmInventory'),
      ]);
    });
  },

  /**
   * Adds group to the members of a automation inventory
   * @param {String} atmInventoryId
   * @param {String} groupId
   * @return {Promise}
   */
  addMemberGroupToAtmInventory(atmInventoryId, groupId) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');

    return onedataGraph.request({
      gri: gri({
        entityType: atmInventoryEntityType,
        entityId: atmInventoryId,
        aspect: 'group',
        aspectId: groupId,
        scope: 'auto',
      }),
      operation: 'create',
    }).then(() => allFulfilled([
      recordManager.reloadRecordListById(
        'atmInventory',
        atmInventoryId,
        'group'
      ).catch(ignoreForbiddenError),
      recordManager.reloadRecordListById(
        'atmInventory',
        atmInventoryId,
        'user'
      ).catch(ignoreForbiddenError),
    ]));
  },

  /**
   * @param {String} atmInventoryId
   * @param {Object} atmLambdaPrototype
   * @returns {Promise<Models.AtmLambda>}
   */
  async createAtmLambda(atmInventoryId, atmLambdaPrototype) {
    const {
      recordManager,
      store,
    } = this.getProperties('recordManager', 'store');

    const atmLambda = await store.createRecord(
      'atmLambda',
      Object.assign({}, atmLambdaPrototype, {
        _meta: {
          additionalData: {
            atmInventoryId,
          },
        },
      })
    ).save();
    await recordManager
      .reloadRecordListById('atmInventory', atmInventoryId, 'atmLambda')
      .catch(ignoreForbiddenError);
    return atmLambda;
  },

  /**
   * @param {String} atmInventoryId
   * @param {Object} workflowSchemaPrototype
   * @returns {Promise<Models.AtmWorkflowSchema>}
   */
  createAtmWorkflowSchema(atmInventoryId, workflowSchemaPrototype) {
    // FIXME: VFS-7597 implement workflow schema creation
    return resolve(workflowSchemaPrototype);
  },
});
