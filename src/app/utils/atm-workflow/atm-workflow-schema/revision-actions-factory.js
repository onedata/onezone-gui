/**
 * Generates actions for specific atm workflow schema revision.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import RevisionActionsFactory from 'onedata-gui-common/utils/revisions/revision-actions-factory';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';

export default RevisionActionsFactory.extend(OwnerInjector, {
  workflowActions: service(),

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  atmInventory: undefined,

  /**
   * @virtual
   * @type {Models.AtmWorkflowSchema}
   */
  atmWorkflowSchema: undefined,

  /**
   * @virtual optional
   * @type {(atmWorkflowSchema: Models.AtmWorkflowSchema, createdRevisionNumber: RevisionNumber) => void)}
   */
  onRevisionCreated: undefined,

  /**
   * @override
   */
  createActionsForRevisionNumber(revisionNumber) {
    return [
      this.createRedesignAsNewRevisionAction(revisionNumber),
      this.createDuplicateRevisionAction(revisionNumber),
      this.createDumpRevisionAction(revisionNumber),
      this.createRemoveRevisionAction(revisionNumber),
    ];
  },

  /**
   * @override
   */
  createCreateRevisionAction() {
    const {
      workflowActions,
      atmWorkflowSchema,
      onRevisionCreated,
    } = this.getProperties('workflowActions', 'atmWorkflowSchema', 'onRevisionCreated');

    const action = workflowActions.createCreateAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
    });
    if (onRevisionCreated) {
      action.addExecuteHook((result) => {
        if (result && get(result, 'status') === 'done') {
          onRevisionCreated(atmWorkflowSchema, get(result, 'result'));
        }
      });
    }
    return action;
  },

  /**
   * @private
   * @param {RevisionNumber} revisionNumber
   * @returns {Utils.Action}
   */
  createRedesignAsNewRevisionAction(revisionNumber) {
    const {
      workflowActions,
      atmWorkflowSchema,
      onRevisionCreated,
    } = this.getProperties('workflowActions', 'atmWorkflowSchema', 'onRevisionCreated');

    const action = workflowActions.createCreateAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      originRevisionNumber: revisionNumber,
    });
    if (onRevisionCreated) {
      action.addExecuteHook((result) => {
        if (result && get(result, 'status') === 'done') {
          onRevisionCreated(atmWorkflowSchema, get(result, 'result'));
        }
      });
    }
    return action;
  },

  /**
   * @private
   * @param {RevisionNumber} revisionNumber
   * @returns {Utils.Action}
   */
  createDuplicateRevisionAction(revisionNumber) {
    const action = this.workflowActions.createDuplicateAtmRecordRevisionAction({
      atmModelName: 'atmWorkflowSchema',
      atmRecord: this.atmWorkflowSchema,
      revisionNumber,
      atmInventory: this.atmInventory,
    });
    if (this.onRevisionCreated) {
      action.addExecuteHook((result) => {
        if (result && get(result, 'status') === 'done') {
          const {
            // This atm record is different than atm record from upper scope.
            // It is a "target" atm record, where the duplicate has been saved.
            atmRecord,
            revisionNumber,
          } = get(result, 'result') || {};
          if (atmRecord && revisionNumber) {
            this.onRevisionCreated(atmRecord, revisionNumber);
          }
        }
      });
    }
    return action;
  },

  /**
   * @private
   * @param {RevisionNumber} revisionNumber
   * @returns {Utils.Action}
   */
  createDumpRevisionAction(revisionNumber) {
    const {
      workflowActions,
      atmWorkflowSchema,
    } = this.getProperties('workflowActions', 'atmWorkflowSchema');

    return workflowActions.createDumpAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber,
    });
  },

  /**
   * @private
   * @param {RevisionNumber} revisionNumber
   * @returns {Utils.Action}
   */
  createRemoveRevisionAction(revisionNumber) {
    const {
      workflowActions,
      atmWorkflowSchema,
    } = this.getProperties('workflowActions', 'atmWorkflowSchema');

    return workflowActions.createRemoveAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber,
    });
  },
});
