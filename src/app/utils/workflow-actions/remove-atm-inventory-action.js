/**
 * Removes automation inventory.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

export default Action.extend({
  recordManager: service(),
  modalManager: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.removeAtmInventoryAction',

  /**
   * @override
   */
  icon: 'browser-delete',

  /**
   * @override
   */
  className: 'remove-atm-inventory-action-trigger',

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @override
   */
  onExecute() {
    const {
      atmInventory,
      modalManager,
    } = this.getProperties(
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
            atmInventoryName: get(atmInventory, 'name'),
          }),
        }],
        yesButtonText: this.t('modalYes'),
        yesButtonType: 'danger',
        onSubmit: () =>
          result.interceptPromise(this.removeAtmInventory()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async removeAtmInventory() {
    const {
      recordManager,
      atmInventory,
      navigationState,
    } = this.getProperties(
      'recordManager',
      'atmInventory',
      'navigationState'
    );

    await recordManager.removeRecord(atmInventory);
    await navigationState.redirectToCollectionIfResourceNotExist();
  },
});
