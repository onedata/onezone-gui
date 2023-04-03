/**
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import { computed } from '@ember/object';

export const entityType = 'atm_workflow_schema';

/**
 * @typedef {Object} AtmWorkflowSchemaRevision
 * @property {String} description
 * @property {'draft'|'stable'|'deprecated'} state
 * @property {Array<AtmStoreSchema>} stores
 * @property {Array<AtmLaneSchema>} lanes
 */

/**
 * @typedef {AtmAuditLogStoreSchema|AtmListStoreSchema|AtmSingleValueStoreSchema|AtmTreeForestStoreSchema|AtmRangeStoreSchema} AtmStoreSchema
 */

/**
 * @typedef {Object} AtmStoreSchemaBase
 * @property {String} id
 * @property {String} name
 * @property {String} description
 * @property {any} defaultInitialContent
 * @property {Boolean} requiresInitialContent
 */

/**
 * @typedef {AtmStoreSchemaBase} AtmAuditLogStoreSchema
 * @property {'auditLog'} type
 * @property {{ logContentDataSpec: AtmDataSpec }} config
 */

/**
 * @typedef {AtmStoreSchemaBase} AtmListStoreSchema
 * @property {'list'} type
 * @property {{ itemDataSpec: AtmDataSpec }} config
 */

/**
 * @typedef {AtmStoreSchemaBase} AtmSingleValueStoreSchema
 * @property {'singleValue'} type
 * @property {{ itemDataSpec: AtmDataSpec }} config
 */

/**
 * @typedef {AtmStoreSchemaBase} AtmTreeForestStoreSchema
 * @property {'treeForest'} type
 * @property {{ itemDataSpec: AtmDataSpec }} config
 */

/**
 * @typedef {AtmStoreSchemaBase} AtmRangeStoreSchema
 * @property {'range'} type
 * @property {Object} [config] if present, it is always an empty object
 */

/**
 * @typedef {Object} AtmLaneSchema
 * @property {String} id
 * @property {String} name
 * @property {AtmLaneStoreIteratorSpec} storeIteratorSpec
 * @property {Array<AtmParallelBoxSchema>} parallelBoxes
 */

/**
 * @typedef {Object} AtmLaneStoreIteratorSpec
 * @property {String} storeSchemaId
 * @property {Number} maxBatchSize
 */

/**
 * @typedef {Object} ParallelBoxSchema
 * @property {String} id
 * @property {String} name
 * @property {Array<AtmTaskSchema>} tasks
 */

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {ComputedProperty<String>}
   */
  name: attr('string'),

  /**
   * @type {ComputedProperty<String>}
   */
  summary: attr('string'),

  /**
   * Contains mapping (revisionNumber: String) -> AtmWorkflowSchemaRevision
   * @type {ComputedProperty<Object>}
   */
  revisionRegistry: attr('object'),

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: belongsTo('atm-inventory'),

  /**
   * List of lambdas used by schema tasks.
   * @type {ComputedProperty<Models.AtmLambdaList>}
   */
  atmLambdaList: belongsTo('atm-lambda-list'),

  /**
   * In case if this workflow schema is a dumped another schema, then that
   * 'another' schema is referenced here (if available).
   * @type {ComputedProperty<Models.AtmWorkflowSchema|null>}
   */
  originalAtmWorkflowSchema: belongsTo('atm-workflow-schema'),

  /**
   * ID taken from `originalAtmWorkflowSchema` relation.
   * @type {ComputedProperty<string|null>}
   */
  originalAtmWorkflowSchemaId: computed('isLoaded', function originalAtmWorkflowSchemaId() {
    if (!this.isLoaded) {
      return null;
    }
    return this.relationEntityId('originalAtmWorkflowSchema');
  }),
}).reopenClass(StaticGraphModelMixin);
