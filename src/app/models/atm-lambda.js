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
 * @typedef {Object} AtmLambdaExecutionOptions
 * @property {Boolean} readonly
 * @property {Boolean} mountSpaceOptions.mountOneclient
 * @property {String} mountSpaceOptions.mountPoint
 * @property {String} mountSpaceOptions.oneclientOptions
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
 *   `'histogram'`, `'dataset'`, `'archive'`, `'storeCredentials'`, `'onedatafsOptions'`
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
 * @typedef {AtmDataTypeValueConstraints} AtmStoreCredentialsValueConstraints
 * @param {String} storeType one of: `'singleValue'`, `'list'`, `'map'`, `'treeForest'`,
 *   `'range'`, `'histogram'`
 */

/**
 * @typedef {AtmDataTypeValueConstraints} AtmStringTypeValueConstraints
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
   * One of: `openfaas`, `onedataFunction`
   * @type {ComputedProperty<String>}
   */
  engine: attr('string'),

  /**
   * @type {ComputedProperty<String>}
   */
  operationRef: attr('string'),

  /**
   * @type {ComputedProperty<AtmLambdaExecutionOptions>}
   */
  executionOptions: attr('object'),

  /**
   * @type {ComputedProperty<Array<AtmLambdaArgumentSpec>>}
   */
  argumentSpecs: attr('array'),

  /**
   * @type {ComputedProperty<Array<AtmLambdaResultSpec>>}
   */
  resultSpecs: attr('array'),
}).reopenClass(StaticGraphModelMixin);
