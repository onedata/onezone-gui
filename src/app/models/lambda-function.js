/**
 * Lambda function definition (for automation inventory)
 *
 * @module models/lambda-function
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

/**
 * @typedef {Object} OpenfaasOptions
 * @property {String} dockerImage
 */

/**
 * @typedef {Object} OnedataFunctionOptions
 */

/**
 * @typedef {Object} MountSpaceOptions
 * @property {Boolean} enabled
 * @property {String} mountPoint
 * @property {Boolean} readOnly
 * @property {String} oneclientOptions
 */

/**
 * @typedef {Object} LambdaFunctionArgument
 * @property {String} name
 * @property {String} type
 * @property {Boolean} array
 * @property {Boolean} optional
 * @property {String} defaultValue
 */

/**
 * @typedef {Object} LambdaFunctionResult
 * @property {String} name
 * @property {String} type
 * @property {Boolean} array
 * @property {Boolean} optional
 */

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {ComputedProperty<String>}
   */
  name: attr('string'),

  /**
   * @type {ComputedProperty<String>}
   */
  shortDescription: attr('string'),

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
   * Its structure depends on the value of `engine` property
   * @type {ComputedProperty<OpenfaasOptions|OnedataFunctionOptions>}
   */
  engineOptions: attr('object'),

  /**
   * @type {ComputedProperty<MountSpaceOptions>}
   */
  mountSpaceOptions: attr('object'),

  /**
   * @type {ComputedProperty<Array<LambdaFunctionArgument>>}
   */
  arguments: attr('array'),

  /**
   * @type {ComputedProperty<Array<LambdaFunctionResult>>}
   */
  results: attr('array'),
}).reopenClass(StaticGraphModelMixin);
