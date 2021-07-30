/**
 * Removes automation lambda.
 *
 * @module utils/workflow-actions/remove-atm-lambda-action
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
   * @type {ComputedProperty<Models.atmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @type {ComputedProperty<Models.AtmLambda>}
   */
  atmLambda: reads('context.atmLambda'),

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
        yesButtonText: this.t('modalYes'),
        yesButtonClassName: 'btn-danger',
        onSubmit: () =>
          result.interceptPromise(this.removeAtmLambda()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async removeAtmLambda() {
    const {
      recordManager,
      atmInventory,
      atmLambda,
    } = this.getProperties(
      'recordManager',
      'atmInventory',
      'atmLambda',
    );

    await recordManager.removeRelation(atmInventory, atmLambda);
  },
});
