/**
 * Performs backend operations related to workflows.
 *
 * @module services/workflow-manager
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import { entityType as workflowDirectoryEntityType } from 'onezone-gui/models/workflow-directory';
import { entityType as userEntityType } from 'onezone-gui/models/user';
import { all as allFulfilled } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';

export default Service.extend({
  recordManager: service(),
  onedataGraphUtils: service(),

  /**
   * @param {String} workflowDirectoryId
   */
  async removeWorkflowDirectory(workflowDirectoryId) {
    const recordManager = this.get('recordManager');

    await recordManager.removeRecordById(
      'workflowDirectory',
      workflowDirectoryId
    );
    await recordManager.reloadUserRecordList('workflowDirectory');
  },

  /**
   * @param {String} workflowDirectoryId
   */
  async leaveWorkflowDirectory(workflowDirectoryId) {
    const {
      recordManager,
      onedataGraphUtils,
    } = this.getProperties('recordManager', 'onedataGraphUtils');

    const currentUser = recordManager.getCurrentUserRecord();
    await onedataGraphUtils.leaveRelation(
      userEntityType,
      get(currentUser, 'entityId'),
      workflowDirectoryEntityType,
      workflowDirectoryId,
    );
    await recordManager.reloadUserRecordList('workflowDirectory');
  },

  /**
   * @param {String} workflowDirectoryId
   * @param {String} groupId
   */
  async removeGroupFromWorkflowDirectory(workflowDirectoryId, groupId) {
    const {
      onedataGraphUtils,
      recordManager,
    } = this.getProperties('onedataGraphUtils', 'recordManager');
    const workflowDirectory = recordManager.getLoadedRecordById(
      'workflowDirectory',
      workflowDirectoryId
    );
    const group = recordManager.getLoadedRecordById('group', groupId);
    const isEffMemberOfDirectory = !workflowDirectory || get(workflowDirectory, 'isEffectiveMember');
    const isEffMemberOfGroup = !group || get(group, 'isEffectiveMember');
    if (!isEffMemberOfDirectory && !isEffMemberOfGroup) {
      throw { id: 'forbidden' };
    }

    try {
      if (isEffMemberOfGroup) {
        await onedataGraphUtils.leaveRelation(
          'group',
          groupId,
          workflowDirectoryEntityType,
          workflowDirectoryId,
        );
      } else {
        throw null;
      }
    } catch (leaveError) {
      try {
        if (isEffMemberOfDirectory) {
          await onedataGraphUtils.leaveRelation(
            workflowDirectoryEntityType,
            workflowDirectoryId,
            'group',
            groupId,
          );
        } else {
          throw null;
        }
      } catch (removeError) {
        const meaningfulErrors = [leaveError, removeError]
          .without(null).rejectBy('id', 'forbidden');
        if (meaningfulErrors[1]) {
          console.error(
            'service:workflow-manager.removeGroupFromWorkflowDirectory:',
            meaningfulErrors[1]
          );
        }
        throw meaningfulErrors[0] || { id: 'forbidden' };
      }
    }

    await allFulfilled([
      recordManager.reloadRecordListById(
        'workflowDirectory',
        workflowDirectoryId,
        'group'
      ).catch(ignoreForbiddenError),
      recordManager.reloadRecordListById(
        'workflowDirectory',
        workflowDirectoryId,
        'user'
      ).catch(ignoreForbiddenError),
      recordManager.reloadUserRecordList('workflowDirectory'),
    ]);
  },

  /**
   * @param {string} workflowDirectoryId
   * @param {string} userId
   */
  async removeUserFromWorkflowDirectory(workflowDirectoryId, userId) {
    const {
      recordManager,
      onedataGraphUtils,
    } = this.getProperties('recordManager', 'onedataGraphUtils');
    const currentUser = recordManager.getCurrentUserRecord();
    const loadedWorkflowDirectory =
      recordManager.getLoadedRecordById('workflowDirectory', workflowDirectoryId);

    const reloadRequests = [];
    if (get(currentUser, 'entityId') === userId) {
      await onedataGraphUtils.leaveRelation(
        userEntityType,
        userId,
        workflowDirectoryEntityType,
        workflowDirectoryId,
      );
      reloadRequests.push(
        recordManager.reloadUserRecordList('workflowDirectory')
      );
    } else {
      await onedataGraphUtils.leaveRelation(
        workflowDirectoryEntityType,
        workflowDirectoryId,
        userEntityType,
        userId,
      );
    }
    if (loadedWorkflowDirectory) {
      reloadRequests.push(loadedWorkflowDirectory.reload());
    }

    await allFulfilled([
      ...reloadRequests,
      recordManager.reloadRecordListById(
        'workflowDirectory',
        workflowDirectoryId,
        'user'
      ).catch(ignoreForbiddenError),
    ]);
  },
});
