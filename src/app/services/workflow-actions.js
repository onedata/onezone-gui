/**
 * Provides workflows manipulation functions ready to use for GUI.
 *
 * @module services/workflow-actions
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import ModifyWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/modify-workflow-directory-action';
import RemoveWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/remove-workflow-directory-action';

export default Service.extend({
  workflowManager: service(),
  globalNotify: service(),

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     workflowDirectory: Models.WorkflowDirectory,
   *     workflowDirectoryDiff: Object,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.ModifyWorkflowDirectoryAction}
   */
  createModifyWorkflowDirectoryAction(context) {
    return ModifyWorkflowDirectoryAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     workflowDirectory: Models.WorkflowDirectory,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.RemoveWorkflowDirectoryAction}
   */
  createRemoveWorkflowDirectoryAction(context) {
    return RemoveWorkflowDirectoryAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Model.WorkflowDirectory} workflowDirectory
   * @returns {Promise}
   */
  leaveWorkflowDirectory(workflowDirectory) {
    const {
      workflowManager,
      globalNotify,
    } = this.getProperties('workflowManager', 'globalNotify');

    return workflowManager.leaveWorkflowDirectory(get(workflowDirectory, 'entityId'))
      .then(() => {
        globalNotify.success(this.t(
          'leaveWorkflowDirectoryrSuccess', {
            workflowDirectoryName: get(workflowDirectory, 'name'),
          }));
      })
      .catch(error => {
        globalNotify.backendError(this.t('leavingWorkflowDirectory'), error);
        throw error;
      });
  },
});
