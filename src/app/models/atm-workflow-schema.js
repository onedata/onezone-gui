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

export default Model.extend(GraphSingleModelMixin, {
  /**
   * @type {ComputedProperty<String>}
   */
  name: attr('string'),

  /**
   * @type {ComputedProperty<String>}
   */
  description: attr('string'),

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
   * @type {ComputedProperty<Array<Object>>}
   */
  lanes: attr('array'),

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  stores: attr('array'),
}).reopenClass(StaticGraphModelMixin);
