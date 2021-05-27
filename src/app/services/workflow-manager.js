/**
 * Performs backend operations related to workflows.
 *
 * @module services/workflow-manager
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { observer, get, getProperties } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as atmInventoryEntityType } from 'onezone-gui/models/atm-inventory';
import { all as allFulfilled, resolve } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import { promise } from 'ember-awesome-macros';
import onlyFulfilledValues from 'onedata-gui-common/utils/only-fulfilled-values';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';

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
   * @param {Object} atmWorkflowSchemaPrototype
   * @returns {Promise<Models.AtmWorkflowSchema>}
   */
  async createAtmWorkflowSchema(atmInventoryId, atmWorkflowSchemaPrototype) {
    const {
      recordManager,
      store,
    } = this.getProperties('recordManager', 'store');

    const atmWorkflowSchema = await store.createRecord(
      'atmWorkflowSchema',
      Object.assign({}, atmWorkflowSchemaPrototype, {
        _meta: {
          additionalData: {
            atmInventoryId,
          },
        },
      })
    ).save();
    await recordManager
      .reloadRecordListById('atmInventory', atmInventoryId, 'atmWorkflowSchema')
      .catch(ignoreForbiddenError);
    return atmWorkflowSchema;
  },

  /**
   * @returns {PromiseArray<Models.AtmLambda>}
   */
  getAllKnownAtmLambdas() {
    const knownAtmLambdasProxy = AllKnownAtmLambdasProxyArray.create({
      recordManager: this.get('recordManager'),
    });
    return promiseArray(
      get(knownAtmLambdasProxy, 'atmLambdasProxy').then(() => knownAtmLambdasProxy)
    );
  },
});

const AllKnownAtmLambdasProxyArray = PromiseArray.extend({
  /**
   * @virtual
   */
  recordManager: undefined,

  /**
   * @type {ComputedProperty<PromiseArray<Model.AtmInventory>>}
   */
  atmInventoriesProxy: promise.array(function allAtmInventories() {
    return this.get('recordManager').getUserRecordList('atmInventory')
      .then(recordList => get(recordList, 'list'));
  }),

  /**
   * @type {ComputedProperty<PromiseArray<Model.AtmLambda>>}
   */
  atmLambdasProxy: promise.array(
    'allAtmInventoriesProxy.@each.isReloading',
    function allAtmLambdas() {
      return this.get('atmInventoriesProxy')
        .then(atmInventories => onlyFulfilledValues(
          atmInventories.mapBy('atmLambdaList')
        ))
        .then(atmLambdaLists =>
          onlyFulfilledValues(atmLambdaLists.compact().mapBy('list'))
        );
    }
  ),

  atmLambdasProxyObserver: observer(
    'atmLambdasProxy.[]',
    function atmLambdasProxyObserver() {
      const {
        isFulfilled,
        content,
      } = getProperties(this.get('atmLambdasProxy'), 'isFulfilled', 'content');

      if (isFulfilled) {
        this.set('content', content);
      }
    }
  ),
});
