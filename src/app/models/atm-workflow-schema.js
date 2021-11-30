/**
 * @module models/atm-workflow-schema
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

export const entityType = 'atm_workflow_schema';

/**
 * @typedef {Object} AtmWorkflowSchemaRevision
 * @property {String} description
 * @property {'draft'|'stable'|'deprecated'} state
 * @property {Array<AtmStoreSchema>} stores
 * @property {Array<AtmLaneSchema>} lanes
 */

/**
 * @typedef {Object} AtmStoreSchema
 * @property {String} id
 * @property {String} name
 * @property {String} description
 * @property {AtmStoreType} type
 * @property {AtmDataSpec} dataSpec
 * @property {any} defaultInitialValue
 * @property {Boolean} requiresInitialValue
 */

/**
 * @typedef {'list'|'treeForest'|'singleValue'|'range'|'auditLog'} AtmStoreType
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

/**
 * @typedef {Object} AtmTaskSchema
 * @property {String} id
 * @property {String} name
 * @property {String} lambdaId
 * @property {RevisionNumber} lambdaRevisionNumber
 * @property {AtmTaskArgumentMapping} argumentMappings
 * @property {AtmTaskResultMapping} resultMappings
 * @property {AtmResourceSpec|null} resourceSpecOverride
 */

/**
 * @typedef {Object} AtmTaskArgumentMapping
 * @property {String} argumentName
 * @property {AtmTaskArgumentMappingValueBuilder} valueBuilder
 */

/**
 * @typedef {Object} AtmTaskArgumentMappingValueBuilder
 * @property {'onedatafsCredentials'|'iteratedItem'|'const'|'singleValueStoreContent'} valueBuilderType
 * @property {any} valueBuilderRecipe has different meaning depending on `valueBuilderType`:
 *  - JSON value for `'const'`,
 *  - store schema id for `'singleValueStoreContent'`
 */

/**
 * @typedef {Object} AtmTaskResultMapping
 * @property {String} resultName
 * @property {String} storeSchemaId
 * @property {'set'|'append'|'extend'} dispatchFunction
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
   * ID taken from `originalAtmWorkflowSchema` relation. Set in `didLoad`.
   * @type {String}
   */
  originalAtmWorkflowSchemaId: undefined,

  didLoad() {
    this._super(...arguments);
    this.set(
      'originalAtmWorkflowSchemaId',
      this.relationEntityId('originalAtmWorkflowSchema')
    );
  },
}).reopenClass(StaticGraphModelMixin);
