/**
 * Performs backend operations related to workflows.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import {
  computed,
  observer,
  get,
  getProperties,
  set,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import WorkflowManager from 'onedata-gui-common/services/workflow-manager';
import gri from 'onedata-gui-websocket-client/utils/gri';
import {
  entityType as atmInventoryEntityType,
} from 'onezone-gui/models/atm-inventory';
import {
  entityType as atmWorkflowSchemaEntityType,
} from 'onezone-gui/models/atm-workflow-schema';
import { entityType as atmLambdaEntityType } from 'onezone-gui/models/atm-lambda';
import {
  all as allFulfilled,
  allSettled,
  resolve,
} from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import { promise } from 'ember-awesome-macros';
import onlyFulfilledValues from 'onedata-gui-common/utils/only-fulfilled-values';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import ArrayProxy from '@ember/array/proxy';
import getNextFreeRevisionNumber from 'onedata-gui-common/utils/revisions/get-next-free-revision-number';

export default WorkflowManager.extend({
  store: service(),
  recordManager: service(),
  onedataGraph: service(),
  onedataConnection: service(),

  /**
   * @override
   */
  atmInstantFailureExceptionThreshold: reads(
    'onedataConnection.defaultAtmInstantFailureExceptionThreshold'
  ),

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
   * @returns {Promise}
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
   * @returns {Promise}
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
            originalAtmLambdaId: atmLambdaPrototype.originalAtmLambdaId,
            revision: atmLambdaPrototype.revision,
            schemaFormatVersion: atmLambdaPrototype.schemaFormatVersion,
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
   * @param {string} atmLambdaId
   * @param {RevisionNumber} revisionNumber
   * @returns {Promise<Object>} lambda dump
   */
  async getAtmLambdaDump(atmLambdaId, revisionNumber) {
    return await this.onedataGraph.request({
      gri: gri({
        entityType: atmLambdaEntityType,
        entityId: atmLambdaId,
        aspect: 'dump',
        scope: 'private',
      }),
      operation: 'create',
      subscribe: false,
      data: {
        includeRevision: revisionNumber,
      },
    });
  },

  /**
   * @param {string} atmLambdaId
   * @param {Object} atmLambdaDump
   * @returns {Promise<{ atmLambda: Models.AtmLambda, revisionNumber: RevisionNumber }>}
   */
  async mergeAtmLambdaDumpToExistingLambda(
    atmLambdaId,
    atmLambdaDump
  ) {
    const atmLambda =
      await this.recordManager.getRecordById('atmLambda', atmLambdaId);

    const revisionNumberFromDump = atmLambdaDump?.revision?.originalRevisionNumber;
    const existingRevisionNumbers = Object.keys(get(atmLambda, 'revisionRegistry'))
      .map((rev) => Number.parseInt(rev));
    const targetRevisionNumber = revisionNumberFromDump &&
      !existingRevisionNumbers.includes(revisionNumberFromDump) ?
      revisionNumberFromDump : getNextFreeRevisionNumber(existingRevisionNumbers);
    if (targetRevisionNumber !== revisionNumberFromDump && atmLambdaDump?.revision) {
      set(atmLambdaDump, 'revision.originalRevisionNumber', targetRevisionNumber);
    }

    await this.onedataGraph.request({
      gri: gri({
        entityType: atmLambdaEntityType,
        entityId: atmLambdaId,
        aspect: 'instance',
        scope: 'private',
      }),
      operation: 'update',
      subscribe: false,
      data: atmLambdaDump,
    });
    await this.recordManager.reloadRecordById('atmLambda', atmLambdaId);

    return {
      atmLambda,
      revisionNumber: targetRevisionNumber,
    };
  },

  /**
   * @param {String} atmLambdaId
   * @param {RevisionNumber} revisionNumber
   * @param {Object} revisionData
   */
  async createAtmLambdaRevision(atmLambdaId, revisionNumber, revisionData) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');

    await onedataGraph.request({
      gri: gri({
        entityType: atmLambdaEntityType,
        entityId: atmLambdaId,
        aspect: `revision,${revisionNumber}`,
        scope: 'private',
      }),
      operation: 'create',
      subscribe: false,
      data: {
        atmLambdaRevision: revisionData,
      },
    });
    await recordManager.reloadRecordById('atmLambda', atmLambdaId);
  },

  /**
   * @param {String} atmLambdaId
   * @param {RevisionNumber} revisionNumber
   * @param {Object} revisionDataUpdate
   */
  async updateAtmLambdaRevision(atmLambdaId, revisionNumber, revisionDataUpdate) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');

    await onedataGraph.request({
      gri: gri({
        entityType: atmLambdaEntityType,
        entityId: atmLambdaId,
        aspect: `revision,${revisionNumber}`,
        scope: 'private',
      }),
      operation: 'update',
      subscribe: false,
      data: revisionDataUpdate,
    });
    await recordManager.reloadRecordById('atmLambda', atmLambdaId);
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
            originalAtmWorkflowSchemaId: atmWorkflowSchemaPrototype
              .originalAtmWorkflowSchemaId,
            revision: atmWorkflowSchemaPrototype.revision,
            schemaFormatVersion: atmWorkflowSchemaPrototype.schemaFormatVersion,
          },
        },
      })
    ).save();
    // If workflow is created from workflow dump, then we need to reload lambdas
    const reloadLambdasPromise = atmWorkflowSchemaPrototype.originalAtmWorkflowSchemaId ?
      recordManager.reloadRecordListById('atmInventory', atmInventoryId, 'atmLambda')
      .catch(ignoreForbiddenError) : resolve();
    await allFulfilled([
      recordManager
      .reloadRecordListById('atmInventory', atmInventoryId, 'atmWorkflowSchema')
      .catch(ignoreForbiddenError),
      reloadLambdasPromise,
    ]);
    return atmWorkflowSchema;
  },

  /**
   * @param {String} atmWorkflowSchemaId
   * @param {RevisionNumber} revisionNumber
   * @returns {Promise<Object>} workflow schema dump
   */
  async getAtmWorkflowSchemaDump(atmWorkflowSchemaId, revisionNumber) {
    return await this.get('onedataGraph').request({
      gri: gri({
        entityType: atmWorkflowSchemaEntityType,
        entityId: atmWorkflowSchemaId,
        aspect: 'dump',
        scope: 'private',
      }),
      operation: 'create',
      subscribe: false,
      data: {
        includeRevision: revisionNumber,
      },
    });
  },

  /**
   * @param {String} atmWorkflowSchemaId
   * @param {Object} atmWorkflowSchemaDump
   * @returns {Promise<Models.AtmWorkflowSchema>}
   */
  async mergeAtmWorkflowSchemaDumpToExistingSchema(
    atmWorkflowSchemaId,
    atmWorkflowSchemaDump
  ) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');

    await onedataGraph.request({
      gri: gri({
        entityType: atmWorkflowSchemaEntityType,
        entityId: atmWorkflowSchemaId,
        aspect: 'instance',
        scope: 'private',
      }),
      operation: 'update',
      subscribe: false,
      data: atmWorkflowSchemaDump,
    });
    let atmWorkflowSchema = await recordManager
      .reloadRecordById('atmWorkflowSchema', atmWorkflowSchemaId);
    if (!atmWorkflowSchema) {
      atmWorkflowSchema = await recordManager
        .getRecordById('atmWorkflowSchema', atmWorkflowSchemaId);
    }
    return atmWorkflowSchema;
  },

  /**
   * @param {String} atmWorkflowSchemaId
   * @param {RevisionNumber} revisionNumber
   * @param {Object} revisionData
   */
  async saveAtmWorkflowSchemaRevision(
    atmWorkflowSchemaId,
    revisionNumber,
    revisionData
  ) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');

    await onedataGraph.request({
      gri: gri({
        entityType: atmWorkflowSchemaEntityType,
        entityId: atmWorkflowSchemaId,
        aspect: `revision,${revisionNumber}`,
        scope: 'private',
      }),
      operation: 'create',
      subscribe: false,
      data: {
        atmWorkflowSchemaRevision: revisionData,
      },
    });
    await recordManager
      .reloadRecordById('atmWorkflowSchema', atmWorkflowSchemaId);
  },

  /**
   * @param {String} atmWorkflowSchemaId
   * @param {RevisionNumber} revisionNumber
   */
  async removeAtmWorkflowSchemaRevision(atmWorkflowSchemaId, revisionNumber) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');

    await onedataGraph.request({
      gri: gri({
        entityType: atmWorkflowSchemaEntityType,
        entityId: atmWorkflowSchemaId,
        aspect: `revision,${revisionNumber}`,
        scope: 'private',
      }),
      operation: 'delete',
      subscribe: false,
    });
    await recordManager
      .reloadRecordById('atmWorkflowSchema', atmWorkflowSchemaId);
  },

  /**
   * @param {String} atmLambdaId
   * @param {String} atmInventoryId
   */
  async attachAtmLambdaToAtmInventory(atmLambdaId, atmInventoryId) {
    const {
      onedataGraph,
      recordManager,
    } = this.getProperties('onedataGraph', 'recordManager');
    await onedataGraph.request({
      gri: gri({
        entityType: atmLambdaEntityType,
        entityId: atmLambdaId,
        aspect: atmInventoryEntityType,
        aspectId: atmInventoryId,
        scope: 'auto',
      }),
      operation: 'create',
      subscribe: false,
    });
    await allSettled([
      recordManager.reloadRecordListById('atmInventory', atmInventoryId, 'atmLambda'),
      recordManager.reloadRecordListById('atmLambda', atmLambdaId, 'atmInventory'),
    ]);
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

  /**
   * @param {Models.AtmInventory} atmInventory
   * @returns {PromiseArray<Models.AtmLambda>}
   */
  getAtmLambdasUsedByAtmInventory(atmInventory) {
    const usedAtmLambdasProxy = AtmLambdasUsedByAtmInventoryProxyArray.create({
      recordManager: this.get('recordManager'),
      atmInventory,
    });
    return promiseArray(
      get(usedAtmLambdasProxy, 'atmLambdasProxy').then(() => usedAtmLambdasProxy)
    );
  },
});

const AllKnownAtmLambdasProxyArray = ArrayProxy.extend({
  /**
   * @virtual
   */
  recordManager: undefined,

  /**
   * @type {ComputedProperty<PromiseArray<Model.AtmInventory>>}
   */
  atmInventoriesProxy: promise.array(computed(async function atmInventoriesProxy() {
    const atmInventories = await this.get('recordManager').getUserRecordList('atmInventory');
    return await get(atmInventories, 'list');
  })),

  /**
   * @type {ComputedProperty<PromiseArray<DS.RecordArray<Model.AtmLambda>>>}
   */
  atmLambdasListsProxy: promise.array(computed(
    'atmInventoriesProxy.@each.isReloading',
    async function atmLambdasListsProxy() {
      const atmInventories = await this.get('atmInventoriesProxy');
      const atmLambdaLists = await onlyFulfilledValues(
        atmInventories.mapBy('atmLambdaList')
      );
      return await onlyFulfilledValues(atmLambdaLists.compact().mapBy('list'));
    }
  )),

  /**
   * @type {ComputedProperty<PromiseArray<Model.AtmLambda>>}
   */
  atmLambdasProxy: promise.array(computed(
    'atmLambdasListsProxy.@each.isReloading',
    async function atmLambdasProxy() {
      const atmLambdasLists = await this.get('atmLambdasListsProxy');
      const lambdasArray = [];
      atmLambdasLists.forEach(list => lambdasArray.push(...list.toArray()));
      return lambdasArray.uniq();
    }
  )),

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

const AtmLambdasUsedByAtmInventoryProxyArray = ArrayProxy.extend({
  /**
   * @virtual
   */
  recordManager: undefined,

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @type {ComputedProperty<PromiseArray<Model.AtmWorkflowSchema>>}
   */
  atmWorkflowSchemasProxy: promise.array(
    computed('atmInventory', async function atmWorkflowSchemasProxy() {
      const atmInventory = this.get('atmInventory');
      const atmWorkflowSchemas = await get(atmInventory, 'atmWorkflowSchemaList');
      return await get(atmWorkflowSchemas || {}, 'list');
    })
  ),

  /**
   * @type {ComputedProperty<PromiseArray<DS.RecordArray<Model.AtmLambda>>>}
   */
  atmLambdasListsProxy: promise.array(computed(
    'atmWorkflowSchemasProxy.@each.isReloading',
    async function atmLambdasListsProxy() {
      const atmWorkflowSchemas = await this.get('atmWorkflowSchemasProxy');
      const atmLambdaLists = await onlyFulfilledValues(
        atmWorkflowSchemas.mapBy('atmLambdaList')
      );
      return await onlyFulfilledValues(atmLambdaLists.compact().mapBy('list'));
    }
  )),

  /**
   * @type {ComputedProperty<PromiseArray<Model.AtmLambda>>}
   */
  atmLambdasProxy: promise.array(computed(
    'atmLambdasListsProxy.@each.isReloading',
    async function atmLambdasProxy() {
      const atmLambdasLists = await this.get('atmLambdasListsProxy');
      const lambdasArray = [];
      atmLambdasLists.forEach(list => lambdasArray.push(...list.toArray()));
      return lambdasArray.uniq();
    }
  )),

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
