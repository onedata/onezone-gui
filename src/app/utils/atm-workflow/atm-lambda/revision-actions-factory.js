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
import { conditional, eq, raw } from 'ember-awesome-macros';
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
   * @virtual
   * @type {(originRevisionNumber: RevisionNumber) => void}
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

    return StartRevisionCreationAction.create({
      ownerSource: this,
      atmLambda,
      onRevisionCreate,
    });
  },

  /**
   * @private
   * @param {RevisionNumber} revisionNumber
   * @returns {Utils.Action}
   */
  createRedesignAsNewAtmLambdaRevisionAction(revisionNumber) {
    const {
      atmLambda,
      onRevisionCreate,
    } = this.getProperties('atmLambda', 'onRevisionCreate');

    return StartRevisionCreationAction.create({
      ownerSource: this,
      atmLambda,
      originRevisionNumber: revisionNumber,
      onRevisionCreate,
    });
  },
});

const StartRevisionCreationAction = Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'utils.atmWorkflow.atmLambda.revisionActionsFactory.startRevisionCreationAction',

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
   * @override
   */
  disabled: reads('isOriginRevisionOnedataFunction'),

  /**
   * @override
   */
  tip: conditional(
    'isOriginRevisionOnedataFunction',
    computedT('disabledTip.onedataFunction'),
    raw(null)
  ),

  /**
   * @type {ComputedProperty<Models.AtmLambda>}
   */
  atmLambda: reads('context.atmLambda'),

  /**
   * @type {ComputedProperty<RevisionNumber|undefined>}
   */
  originRevisionNumber: reads('context.originRevisionNumber'),

  /**
   * @type {ComputedProperty<(originRevisionNumber: RevisionNumber) => void>}
   */
  onRevisionCreate: reads('context.onRevisionCreate'),

  /**
   * @type {ComputedProperty<RevisionNumber|undefined>}
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
   * @type {ComputedProperty<AtmLambdaRevision>}
   */
  originRevision: computed(
    'atmLambda.revisionRegistry',
    'normalizedOriginRevisionNumber',
    function originRevision() {
      const revisionRegistry = this.get('atmLambda.revisionRegistry') || {};
      const normalizedOriginRevisionNumber = this.get('normalizedOriginRevisionNumber');
      return revisionRegistry[normalizedOriginRevisionNumber] || null;
    }
  ),

  isOriginRevisionOnedataFunction: eq(
    'originRevision.operationSpec.engine',
    raw('onedataFunction')
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
