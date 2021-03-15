/**
 * Performs backend operations related to workflows.
 *
 * @module services/workflow-manager
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

export default Service.extend({
  recordManager: service(),

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
});
