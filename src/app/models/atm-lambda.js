/**
 * Lambda definition (for automation inventory).
 *
 * @module models/atm-lambda
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { computed } from '@ember/object';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import sortRevisionNumbers from 'onedata-gui-common/utils/revisions/sort-revision-numbers';
import { getBy } from 'ember-awesome-macros';

/**
 * @typedef {Object} AtmLambdaRevision
 * @property {String} name
 * @property {'draft'|'stable'|'deprecated'} state
 * @property {String} summary
 * @property {String} description
 * @property {AtmLambdaOperationSpec} operationSpec
 * @property {Number} preferredBatchSize
 * @property {Array<AtmLambdaArgumentSpec>} argumentSpecs
 * @property {Array<AtmLambdaResultSpec>} resultSpecs
 * @property {AtmResourceSpec} resourceSpec
 */

/**
 * @typedef {Object} AtmLambdaOperationSpec
 * @property {String} engine one of:
 *   `'onedataFunction'`, `'openfaas'`, `'atmWorkflow'`, `'userForm'`
 * @property {String} [functionId] available when `engine` == `'onedataFunction'`
 * @property {String} [dockerImage] available when `engine` == `'openfaas'`
 * @property {String} [workflowId] available when `engine` == `'atmWorkflow'`
 * @property {String} [userFormId] available when `engine` == `'userForm'`
 * @property {AtmLambdaDockerExecutionOptions} dockerExecutionOptions
 *   available when `engine` == `'openfaas'`
 */

/**
 * @typedef {Object} AtmLambdaDockerExecutionOptions
 * @property {Boolean} readonly
 * @property {Boolean} mountOneclient
 * @property {String} [oneclientMountPoint] available when `mountOneclient` is `true`
 * @property {String} [oneclientOptions] available when `mountOneclient` is `true`
 */

/**
 * @typedef {Object} AtmLambdaArgumentSpec
 * @property {String} name
 * @property {AtmDataSpec} dataSpec
 * @property {Boolean} isOptional
 * @property {String} defaultValue
 */

/**
 * @typedef {Object} AtmLambdaResultSpec
 * @property {String} name
 * @property {AtmDataSpec} dataSpec
 */

/**
 * @typedef {Object} AtmDataSpec
 * @property {String} type one of: `'integer'`, `'string'`, `'object'`, `'file'`, `'array'`,
 *   `'histogram'`, `'dataset'`, `'archive'`, `'storeCredentials'`, `'onedatafsCredentials'`
 * @property {AtmDataTypeValueConstraints} valueConstraints its structure depends
 *   on `type` value and its corresponding Atm*TypeValueConstraints
 */

/**
 * @typedef {Object} AtmDataTypeValueConstraints
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmArchiveTypeValueConstraints
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmDatasetTypeValueConstraints
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmFileTypeValueConstraints
 * @param {String} fileType one of: `'REG'`, `'DIR'`, `'SYMLNK'`, `'ANY'`
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmHistogramTypeValueConstraints
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmIntegerTypeValueConstraints
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmObjectTypeValueConstraints
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmOnedatafsCredentialsTypeValueConstraints
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmStoreCredentialsTypeValueConstraints
 * @param {String} storeType one of: `'singleValue'`, `'list'`, `'map'`, `'treeForest'`,
 *   `'range'`, `'histogram'`
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmStringTypeValueConstraints
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmArrayTypeValueConstraints
 * @param {AtmDataSpec} itemDataSpec
 */

/**
 * @type {String}
 */
export const entityType = 'atm_lambda';

export default Model.extend(GraphSingleModelMixin, {
  /**
   * Keys are revision numbers.
   * @type {ComputedProperty<Object<String,AtmLambdaRevision>>}
   */
  revisionRegistry: attr('object'),

  /**
   * @type {ComputedProperty<Models.AtmInventoryList>}
   */
  atmInventoryList: belongsTo('atm-inventory-list'),

  /**
   * In case if this lambda is a dumped another lambda, then that
   * 'another' lambda is referenced here (if available).
   * @type {ComputedProperty<Models.AtmLambda|null>}
   */
  originalAtmLambda: belongsTo('atm-lambda'),

  /**
   * ID taken from `originalAtmLambda` relation. Set in `didLoad`.
   * @type {String}
   */
  originalAtmLambdaId: undefined,

  /**
   * @type {ComputedProperty<Number>}
   */
  latestRevisionNumber: computed(
    'revisionRegistry',
    function latestRevisionNumber() {
      const revisionRegistry = this.get('revisionRegistry') || {};
      const sortedRevisionNumbers =
        sortRevisionNumbers(Object.keys(revisionRegistry));
      return sortedRevisionNumbers[sortedRevisionNumbers.length - 1];
    }
  ),

  /**
   * @type {ComputedProperty<AtmLambdaRevision>}
   */
  latestRevision: getBy('revisionRegistry', 'latestRevisionNumber'),

  didLoad() {
    this._super(...arguments);
    this.set(
      'originalAtmLambdaId',
      this.relationEntityId('originalAtmLambda')
    );
  },
}).reopenClass(StaticGraphModelMixin);
