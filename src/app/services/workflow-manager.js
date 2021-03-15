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
});
