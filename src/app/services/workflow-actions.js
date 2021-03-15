/**
 * Provides workflows manipulation functions ready to use for GUI.
 *
 * @module services/workflow-actions
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import ModifyWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/modify-workflow-directory-action';
import RemoveWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/remove-workflow-directory-action';

export default Service.extend({
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
});
