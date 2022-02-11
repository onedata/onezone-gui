/**
 * Removes workflow.
 *
 * @module utils/workflow-actions/remove-atm-workflow-schema-action
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
  i18nPrefix: 'utils.workflowActions.removeAtmWorkflowSchemaAction',

  /**
   * @override
   */
  icon: 'x',

  /**
   * @override
   */
  className: 'remove-atm-workflow-schema-action-trigger',

  /**
   * @type {ComputedProperty<Models.AtmWorkflowSchema>}
   */
  atmWorkflowSchema: reads('context.atmWorkflowSchema'),

  /**
   * @override
   */
  onExecute() {
    const {
      atmWorkflowSchema,
      modalManager,
    } = this.getProperties(
      'atmWorkflowSchema',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('question-modal', {
        headerIcon: 'sign-warning-rounded',
        headerText: this.t('modalHeader'),
        descriptionParagraphs: [{
          text: this.t('modalDescription', {
            atmWorkflowSchemaName: get(atmWorkflowSchema, 'name'),
          }),
        }],
        yesButtonText: this.t('modalYes'),
        yesButtonType: 'danger',
        onSubmit: () =>
          result.interceptPromise(this.removeAtmWorkflowSchema()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async removeAtmWorkflowSchema() {
    const {
      recordManager,
      atmWorkflowSchema,
    } = this.getProperties(
      'recordManager',
      'atmWorkflowSchema',
    );

    await recordManager.removeRecord(atmWorkflowSchema);
  },
});
