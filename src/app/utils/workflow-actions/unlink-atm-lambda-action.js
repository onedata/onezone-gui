/**
 * Unlinks automation lambda.
 *
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
  i18nPrefix: 'utils.workflowActions.unlinkAtmLambdaAction',

  /**
   * @override
   */
  icon: 'x',

  /**
   * @override
   */
  className: 'unlink-atm-lambda-action-trigger',

  /**
   * @override
   */
  disabled: or(
    not('hasManageLambdasPrivilege'),
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
        return this.t('tip.cannotUnlinkAtmLambdaUsed');
      }

      return '';
    }
  ),

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
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
  willDestroy() {
    try {
      this.cacheFor('atmLambdasUsedByAtmInventoryProxy')?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

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
      .show('unlink-atm-lambda-modal', {
        atmInventory,
        atmLambda,
        onSubmit: ({ inventoriesToUnlink }) =>
          result.interceptPromise(
            this.unlinkAtmLambda(inventoriesToUnlink === 'allInventories')
          ),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async unlinkAtmLambda(unlinkFromOtherAtmInventories) {
    const {
      recordManager,
      atmInventory,
      atmLambda,
    } = this.getProperties(
      'recordManager',
      'atmInventory',
      'atmLambda',
    );

    const removeMainRelationPromise =
      recordManager.removeRelation(atmInventory, atmLambda);
    let removeOtherRelationsPromise = resolve();
    if (unlinkFromOtherAtmInventories) {
      removeOtherRelationsPromise = recordManager.getUserRecordList('atmInventory')
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
      main: removeMainRelationPromise,
      other: removeOtherRelationsPromise,
    });

    if (removalResult.main.state === 'rejected') {
      throw removalResult.main.reason;
    }
  },
});
