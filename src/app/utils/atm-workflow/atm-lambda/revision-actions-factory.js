/**
 * Generates actions for specific atm lambda revision.
 *
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
   * @virtual optional
   * @type {(atmLambda: Models.AtmLambda, createdRevisionNumber: RevisionNumber) => void)}
   */
  onRevisionCreated: undefined,

  /**
   * @override
   */
  createActionsForRevisionNumber(revisionNumber) {
    return [
      this.createRedesignAsNewRevisionAction(revisionNumber),
      this.createDuplicateRevisionAction(revisionNumber),
      this.createDumpRevisionAction(revisionNumber),
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
  createRedesignAsNewRevisionAction(revisionNumber) {
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

  /**
   * @private
   * @param {RevisionNumber} revisionNumber
   * @returns {Utils.Action}
   */
  createDuplicateRevisionAction(revisionNumber) {
    const action = this.workflowActions.createDuplicateAtmRecordRevisionAction({
      atmModelName: 'atmLambda',
      atmRecord: this.atmLambda,
      revisionNumber,
      atmInventory: this.atmInventory,
    });
    if (this.onRevisionCreated) {
      action.addExecuteHook((result) => {
        if (result?.status === 'done') {
          const {
            // This atm record is different than atm record from upper scope.
            // It is a "target" atm record, where the duplicate has been saved.
            atmRecord,
            revisionNumber,
          } = (result.result || {});
          if (atmRecord && revisionNumber) {
            this.onRevisionCreated(atmRecord, revisionNumber);
          }
        }
      });
    }
    return action;
  },

  /**
   * @private
   * @param {RevisionNumber} revisionNumber
   * @returns {Utils.Action}
   */
  createDumpRevisionAction(revisionNumber) {
    return this.workflowActions.createDumpAtmLambdaRevisionAction({
      atmLambda: this.atmLambda,
      revisionNumber: revisionNumber,
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
