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
 * @type {String}
 */
export const entityType = 'atm_lambda';

/**
 * @implements {AtmLambda}
 */
export default Model.extend(GraphSingleModelMixin, {
  /**
   * Keys are revision numbers.
   * @type {ComputedProperty<AtmLambda['revisionRegistry']>}
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
   * ID taken from `originalAtmLambda` relation.
   * @type {ComputedProperty<string|null>}
   */
  originalAtmLambdaId: computed('isLoaded', function originalAtmLambdaId() {
    if (!this.isLoaded) {
      return null;
    }
    return this.relationEntityId('originalAtmLambda');
  }),

  /**
   * @type {ComputedProperty<RevisionNumber>}
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
}).reopenClass(StaticGraphModelMixin);
