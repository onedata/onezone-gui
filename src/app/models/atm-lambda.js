/**
 * Lambda definition (for automation inventory).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { computed, observer } from '@ember/object';
import { belongsTo } from 'onedata-gui-websocket-client/utils/relationships';
import StaticGraphModelMixin from 'onedata-gui-websocket-client/mixins/models/static-graph-model';
import GraphSingleModelMixin from 'onedata-gui-websocket-client/mixins/models/graph-single-model';
import sortRevisionNumbers from 'onedata-gui-common/utils/revisions/sort-revision-numbers';

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
   * ID taken from `originalAtmLambda` relation.
   * @type {string | null}
   */
  originalAtmLambdaId: null,

  /**
   * @type {ComputedProperty<AtmLambdaRevision>}
   */
  latestRevision: computed(
    'revisionRegistry',
    'latestRevisionNumber',
    function latestRevision() {
      return this.revisionRegistry?.[this.latestRevisionNumber];
    }
  ),

  /**
   * ID taken from `originalAtmLambda` relation.
   * @type {ComputedProperty<string|null>}
   */
  originalAtmLambdaIdSetter: observer(
    'originalAtmLambda.id',
    function originalAtmLambdaIdSetter() {
      const originalAtmLambdaId = this.relationEntityId('originalAtmLambda');
      if (
        this.originalAtmLambdaId !== originalAtmLambdaId &&
        originalAtmLambdaId
      ) {
        this.set('originalAtmLambdaId', originalAtmLambdaId);
      }
    }
  ),

  init() {
    this._super(...arguments);
    this.originalAtmLambdaIdSetter();
  },
}).reopenClass(StaticGraphModelMixin);
