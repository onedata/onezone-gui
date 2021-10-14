/**
 * Generates actions for specific atm workflow schema revision.
 *
 * @module utils/atm-workflow/atm-workflow-schema/revision-actions-factory
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RevisionActionsFactory from 'onezone-gui/utils/atm-workflow/revision-actions-factory';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { inject as service } from '@ember/service';

export default RevisionActionsFactory.extend(OwnerInjector, {
  workflowActions: service(),

  /**
   * @virtual
   * @type {Models.AtmWorkflowSchema}
   */
  atmWorkflowSchema: undefined,

  /**
   * @override
   */
  createActionsForRevisionNumber(revisionNumber) {
    return [
      this.createDumpAtmWorkflowSchemaRevisionAction(revisionNumber),
      this.createRemoveAtmWorkflowSchemaRevisionAction(revisionNumber),
    ];
  },

  /**
   * @param {Number} revisionNumber
   * @returns {Utils.Action}
   */
  createDumpAtmWorkflowSchemaRevisionAction(revisionNumber) {
    return this.get('workflowActions').createDumpAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema: this.get('atmWorkflowSchema'),
      revisionNumber,
    });
  },

  /**
   * @param {Number} revisionNumber
   * @returns {Utils.Action}
   */
  createRemoveAtmWorkflowSchemaRevisionAction(revisionNumber) {
    return this.get('workflowActions').createRemoveAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema: this.get('atmWorkflowSchema'),
      revisionNumber,
    });
  },
});
