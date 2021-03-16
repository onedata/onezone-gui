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
import I18n from 'onedata-gui-common/mixins/components/i18n';
import ModifyWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/modify-workflow-directory-action';
import RemoveWorkflowDirectoryAction from 'onezone-gui/utils/workflow-actions/remove-workflow-directory-action';

export default Service.extend(I18n, {
  recordManager: service(),
  workflowManager: service(),
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.workflowActions',

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
      recordManager,
      globalNotify,
    } = this.getProperties('recordManager', 'globalNotify');

    return recordManager.removeUserRelation(workflowDirectory)
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

  /**
   * Creates member group for specified workflow directory
   * @param {Model.WorkflowDirectory} workflowDirectory
   * @param {Object} groupRepresentation
   * @return {Promise}
   */
  createMemberGroupForWorkflowDirectory(workflowDirectory, groupRepresentation) {
    const {
      workflowManager,
      globalNotify,
    } = this.getProperties('workflowManager', 'globalNotify');
    return workflowManager
      .createMemberGroupForWorkflowDirectory(
        get(workflowDirectory, 'entityId'),
        groupRepresentation
      ).then(() => {
        globalNotify.success(this.t('createMemberGroupSuccess', {
          memberGroupName: get(groupRepresentation, 'name'),
        }));
      }).catch(error => {
        globalNotify.backendError(this.t('creatingMemberGroup'), error);
        throw error;
      });
  },

  /**
   * Adds existing group to a workflow directory
   * @param {Model.WorkflowDirectory} workflowDirectory
   * @param {Model.Group} group
   * @return {Promise}
   */
  addMemberGroupToWorkflowDirectory(workflowDirectory, group) {
    const {
      workflowManager,
      globalNotify,
    } = this.getProperties('workflowManager', 'globalNotify');
    return workflowManager.addMemberGroupToWorkflowDirectory(
      get(workflowDirectory, 'entityId'),
      get(group, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('addMemberGroupSuccess', {
        memberGroupName: get(group, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('addingMemberGroup'), error);
      throw error;
    });
  },
});
