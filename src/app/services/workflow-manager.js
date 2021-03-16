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
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as workflowDirectoryEntityType } from 'onezone-gui/models/workflow-directory';
import { all as allFulfilled, resolve } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';

export default Service.extend({
  recordManager: service(),
  onedataGraph: service(),
  onedataGraphUtils: service(),

  /**
   * Joins current user to a workflow directory without token
   * @param {String} workflowDirectoryId
   * @returns {Promise}
   */
  joinWorkflowDirectoryAsUser(workflowDirectoryId) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');
    const currentUser = recordManager.getCurrentUserRecord();
    const loadedWorkflowDirectory = recordManager.getLoadedRecordById(
      'workflowDirectory',
      workflowDirectoryId
    );

    return onedataGraph.request({
      gri: gri({
        entityType: workflowDirectoryEntityType,
        entityId: workflowDirectoryId,
        aspect: 'user',
        aspectId: get(currentUser, 'entityId'),
        scope: 'private',
      }),
      operation: 'create',
      subscribe: false,
    }).then(() => allFulfilled([
      loadedWorkflowDirectory ? loadedWorkflowDirectory.reload() : resolve(),
      recordManager.reloadRecordListById(
        'workflowDirectory',
        workflowDirectoryId,
        'user'
      ).catch(ignoreForbiddenError),
    ]));
  },

  /**
   * Creates member group for specified workflow directory
   * @param {String} workflowDirectoryId
   * @param {Object} groupRepresentation
   * @return {Promise}
   */
  createMemberGroupForWorkflowDirectory(workflowDirectoryId, groupRepresentation) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');
    const currentUser = recordManager.getCurrentUserRecord();

    return onedataGraph.request({
      gri: gri({
        entityType: workflowDirectoryEntityType,
        entityId: workflowDirectoryId,
        aspect: 'group',
        scope: 'auto',
      }),
      operation: 'create',
      data: groupRepresentation,
      authHint: ['asUser', get(currentUser, 'entityId')],
    }).then(() => {
      return allFulfilled([
        recordManager.reloadRecordListById(
          'workflowDirectory',
          workflowDirectoryId,
          'group'
        ).catch(ignoreForbiddenError),
        recordManager.reloadUserRecordList('workflowDirectory'),
      ]);
    });
  },

  /**
   * Adds group to the members of a workflow directory
   * @param {String} workflowDirectoryId
   * @param {String} groupId
   * @return {Promise}
   */
  addMemberGroupToWorkflowDirectory(workflowDirectoryId, groupId) {
    const {
      recordManager,
      onedataGraph,
    } = this.getProperties('recordManager', 'onedataGraph');

    return onedataGraph.request({
      gri: gri({
        entityType: workflowDirectoryEntityType,
        entityId: workflowDirectoryId,
        aspect: 'group',
        aspectId: groupId,
        scope: 'auto',
      }),
      operation: 'create',
    }).then(() => allFulfilled([
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
    ]));
  },
});
