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
import { all as allFulfilled } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';

export default Service.extend({
  recordManager: service(),
  onedataGraph: service(),
  onedataGraphUtils: service(),

  /**
   * Creates member group for specified workflow directory
   * @param {string} workflowDirectoryId
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
   * @param {string} workflowDirectoryId
   * @param {string} groupId
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
