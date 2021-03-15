/**
 * Removes workflow directory.
 *
 * @module utils/workflow-actions/remove-workflow-directory-action
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
  workflowManager: service(),
  modalManager: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.removeWorkflowDirectoryAction',

  /**
   * @override
   */
  icon: 'remove',

  /**
   * @override
   */
  className: 'remove-workflow-directory-action-trigger',

  /**
   * @type {ComputedProperty<Models.WorkflowDirectory>}
   */
  workflowDirectory: reads('context.workflowDirectory'),

  /**
   * @override
   */
  onExecute() {
    const {
      workflowDirectory,
      modalManager,
    } = this.getProperties(
      'workflowDirectory',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('question-modal', {
        headerIcon: 'sign-warning-rounded',
        headerText: this.t('modalHeader'),
        descriptionParagraphs: [{
          text: this.t('modalDescription', {
            workflowDirectoryName: get(workflowDirectory, 'name'),
          }),
        }],
        yesButtonText: this.t('modalYes'),
        yesButtonClassName: 'btn-danger',
        onSubmit: () =>
          result.interceptPromise(this.removeWorkflowDirectory()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async removeWorkflowDirectory() {
    const {
      workflowManager,
      workflowDirectory,
      navigationState,
    } = this.getProperties(
      'workflowManager',
      'workflowDirectory',
      'navigationState'
    );
    const workflowDirectoryId = get(workflowDirectory, 'entityId');

    await workflowManager.removeWorkflowDirectory(workflowDirectoryId);
    await navigationState.redirectToCollectionIfResourceNotExist();
  },
});
