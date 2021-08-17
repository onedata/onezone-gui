/**
 * Removes automation lambda.
 *
 * @module utils/workflow-actions/remove-atm-lambda-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get, computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { not, or, array, bool } from 'ember-awesome-macros';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import { allSettled, hashSettled, resolve } from 'rsvp';

export default Action.extend({
  recordManager: service(),
  modalManager: service(),
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.removeAtmLambdaAction',

  /**
   * @override
   */
  icon: 'x',

  /**
   * @override
   */
  className: 'remove-atm-lambda-action-trigger',

  /**
   * @override
   */
  disabled: or(
    not('atmInventory.privileges.manageLambdas'),
    'isAtmLambdaUsedInAtmInventory'
  ),

  /**
   * @override
   */
  tip: computed(
    'hasManageLambdasPrivilege',
    'isAtmLambdaUsedInAtmInventory',
    function tip() {
      const {
        i18n,
        hasManageLambdasPrivilege,
        isAtmLambdaUsedInAtmInventory,
      } = this.getProperties(
        'i18n',
        'hasManageLambdasPrivilege',
        'isAtmLambdaUsedInAtmInventory'
      );

      if (!hasManageLambdasPrivilege) {
        return insufficientPrivilegesMessage({
          i18n,
          modelName: 'atmInventory',
          privilegeFlag: 'atm_inventory_manage_lambdas',
        });
      } else if (isAtmLambdaUsedInAtmInventory) {
        return this.t('tip.cannotRemoveAtmLambdaUsed');
      }

      return '';
    }
  ),

  /**
   * @type {ComputedProperty<Models.atmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @type {ComputedProperty<Models.AtmLambda>}
   */
  atmLambda: reads('context.atmLambda'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasManageLambdasPrivilege: bool('atmInventory.privileges.manageLambdas'),

  /**
   * @type {ComputedProperty<PromiseArray<Models.AtmLambda>>}
   */
  atmLambdasUsedByAtmInventoryProxy: computed(
    'atmInventory',
    function atmLambdasUsedByAtmInventoryProxy() {
      const {
        atmInventory,
        workflowManager,
      } = this.getProperties('atmInventory', 'workflowManager');

      return workflowManager.getAtmLambdasUsedByAtmInventory(atmInventory);
    }
  ),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isAtmLambdaUsedInAtmInventory: array.includes(
    'atmLambdasUsedByAtmInventoryProxy',
    'atmLambda'
  ),

  /**
   * @override
   */
  onExecute() {
    const {
      atmLambda,
      atmInventory,
      modalManager,
    } = this.getProperties(
      'atmLambda',
      'atmInventory',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('question-modal', {
        headerIcon: 'sign-warning-rounded',
        headerText: this.t('modalHeader'),
        descriptionParagraphs: [{
          text: this.t('modalDescription', {
            atmLambdaName: get(atmLambda, 'name'),
            atmInventoryName: get(atmInventory, 'name'),
          }),
        }],
        checkboxMessage: this.t('modalCheckboxDescription'),
        isCheckboxBlocking: false,
        yesButtonText: this.t('modalYes'),
        yesButtonClassName: 'btn-danger',
        onSubmit: ({ isCheckboxChecked }) =>
          result.interceptPromise(this.removeAtmLambda(isCheckboxChecked)),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async removeAtmLambda(removeFromOtherAtmInventories) {
    const {
      recordManager,
      atmInventory,
      atmLambda,
    } = this.getProperties(
      'recordManager',
      'atmInventory',
      'atmLambda',
    );

    const mainRemoveRelationPromise =
      recordManager.removeRelation(atmInventory, atmLambda);
    let otherRemoveRelationsPromise = resolve();
    if (removeFromOtherAtmInventories) {
      otherRemoveRelationsPromise = recordManager.getUserRecordList('atmInventory')
        .then(atmInventoryList => get(atmInventoryList, 'list'))
        .then(atmInventories => {
          const otherAtmInventoriesToRemoveFrom = atmInventories
            .without(atmInventory)
            .filterBy('privileges.manageLambdas');
          return allSettled(
            otherAtmInventoriesToRemoveFrom.map(otherAtmInventory =>
              recordManager.removeRelation(otherAtmInventory, atmLambda)
            )
          );
        });
    }

    const removalResult = await hashSettled({
      main: mainRemoveRelationPromise,
      other: otherRemoveRelationsPromise,
    });

    if (removalResult.main.state === 'rejected') {
      throw removalResult.main.reason;
    }
  },
});
