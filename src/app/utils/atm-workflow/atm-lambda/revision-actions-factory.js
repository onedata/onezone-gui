/**
 * Generates actions for specific atm lambda revision.
 *
 * @module utils/atm-workflow/atm-lambda/revision-actions-factory
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RevisionActionsFactory from 'onedata-gui-common/utils/revisions/revision-actions-factory';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import { conditional } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import sortRevisionNumbers from 'onedata-gui-common/utils/revisions/sort-revision-numbers';
import { reads } from '@ember/object/computed';

export default RevisionActionsFactory.extend(OwnerInjector, {
  workflowActions: service(),

  /**
   * @virtual
   * @type {Models.AtmLambda}
   */
  atmLambda: undefined,

  /**
   * @type {(originRevisionNumber: number) => void}
   */
  onRevisionCreate: undefined,

  /**
   * @override
   */
  createActionsForRevisionNumber(revisionNumber) {
    return [
      this.createRedesignAsNewAtmLambdaRevisionAction(revisionNumber),
    ];
  },

  /**
   * @override
   */
  createCreateRevisionAction() {
    const {
      atmLambda,
      onRevisionCreate,
    } = this.getProperties('atmLambda', 'onRevisionCreate');

    return CreateRevisionAction.create({
      ownerSource: this,
      atmLambda,
      onRevisionCreate,
    });
  },

  /**
   * @private
   * @param {Number} revisionNumber
   * @returns {Utils.Action}
   */
  createRedesignAsNewAtmLambdaRevisionAction(revisionNumber) {
    const {
      atmLambda,
      onRevisionCreate,
    } = this.getProperties('atmLambda', 'onRevisionCreate');

    return CreateRevisionAction.create({
      ownerSource: this,
      atmLambda,
      originRevisionNumber: revisionNumber,
      onRevisionCreate,
    });
  },
});

const CreateRevisionAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'utils.atmWorkflow.atmLambda.revisionActionsFactory.createRevisionAction',

  /**
   * @override
   */
  className: 'create-atm-lambda-revision-action-trigger',

  /**
   * @override
   */
  icon: 'plus',

  /**
   * @override
   */
  title: conditional(
    'originRevisionNumber',
    computedT('title.redesign'),
    computedT('title.new')
  ),

  /**
   * @type {ComputedProperty<Models.AtmLambda>}
   */
  atmLambda: reads('context.atmLambda'),

  /**
   * @type {ComputedProperty<Number|undefined>}
   */
  originRevisionNumber: reads('context.originRevisionNumber'),

  /**
   * @type {ComputedProperty<(originRevisionNumber: number) => void>}
   */
  onRevisionCreate: reads('context.onRevisionCreate'),

  /**
   * @type {ComputedProperty<Number|undefined>}
   */
  normalizedOriginRevisionNumber: computed(
    'originRevisionNumber',
    'atmLambda.revisionRegistry',
    function normalizedOriginRevisionNumber() {
      const originRevisionNumber = this.get('originRevisionNumber');
      const revisionRegistry = this.get('atmLambda.revisionRegistry') || {};

      if (originRevisionNumber in revisionRegistry) {
        return originRevisionNumber;
      } else {
        const sortedRevisionNumbers = sortRevisionNumbers(Object.keys(revisionRegistry));
        // return latest revision number (or undefined)
        return sortedRevisionNumbers[sortedRevisionNumbers.length - 1];
      }
    }
  ),

  /**
   * @override
   */
  onExecute() {
    const {
      onRevisionCreate,
      normalizedOriginRevisionNumber,
    } = this.getProperties('onRevisionCreate', 'normalizedOriginRevisionNumber');

    if (onRevisionCreate) {
      onRevisionCreate(normalizedOriginRevisionNumber);
    }
  },
});
