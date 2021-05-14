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
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

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
 * @property {Boolean} isBatch
 * @property {Boolean} isOptional
 * @property {String} defaultValue
 */

/**
 * @typedef {Object} AtmLambdaResultSpec
 * @property {String} name
 * @property {AtmDataSpec} dataSpec
 * @property {Boolean} isBatch
 */

/**
 * @typedef {Object} AtmDataSpec
 * @property {String} type one of: `'integer'`, `'string'`, `'object'`, `'file'`,
 *   `'histogram'`, `'dataset'`, `'archive'`, `'storeCredentials'`, `'onedatafsCredentials'`
 * @property {AtmDataTypeValueConstraints} valueConstraints { storeType }its structure depends
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
 * @param {String} fileType one of: `'REG'`, `'DIR'`, `'ANY'`
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
 * @type {String}
 */
export const entityType = 'atm_lambda';

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
   * Is in markdown format
   * @type {ComputedProperty<String>}
   */
  description: attr('string'),

  /**
   * @type {ComputedProperty<AtmLambdaOperationSpec>}
   */
  operationSpec: attr('object'),

  /**
   * @type {ComputedProperty<Array<AtmLambdaArgumentSpec>>}
   */
  argumentSpecs: attr('array'),

  /**
   * @type {ComputedProperty<Array<AtmLambdaResultSpec>>}
   */
  resultSpecs: attr('array'),
}).reopenClass(StaticGraphModelMixin);
