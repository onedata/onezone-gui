/**
 * Generates actions for specific atm workflow schema revision.
 *
 * @module utils/atm-workflow/atm-workflow-schema/revision-actions-factory
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
   * @type {Models.AtmWorkflowSchema}
   */
  atmWorkflowSchema: undefined,

  /**
   * @virtual optional
   * @type {(atmWorkflowSchema: Models.AtmWorkflowSchema, createdRevisionNumber: Number) => void)}
   */
  onRevisionCreated: undefined,

  /**
   * @override
   */
  createActionsForRevisionNumber(revisionNumber) {
    return [
      this.createRedesignAsNewAtmWorkflowSchemaRevisionAction(revisionNumber),
      this.createDuplicateAtmWorkflowSchemaRevisionAction(revisionNumber),
      this.createDumpAtmWorkflowSchemaRevisionAction(revisionNumber),
      this.createRemoveAtmWorkflowSchemaRevisionAction(revisionNumber),
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
   * @param {Number} revisionNumber
   * @returns {Utils.Action}
   */
  createRedesignAsNewAtmWorkflowSchemaRevisionAction(revisionNumber) {
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
   * @param {Number} revisionNumber
   * @returns {Utils.Action}
   */
  createDuplicateAtmWorkflowSchemaRevisionAction(revisionNumber) {
    const {
      workflowActions,
      atmWorkflowSchema,
      onRevisionCreated,
    } = this.getProperties('workflowActions', 'atmWorkflowSchema', 'onRevisionCreated');

    const action = workflowActions.createDuplicateAtmWorkflowSchemaRevisionAction({
      atmWorkflowSchema,
      revisionNumber,
    });
    if (onRevisionCreated) {
      action.addExecuteHook((result) => {
        if (result && get(result, 'status') === 'done') {
          const {
            // This workflow schema is different than workflow schema from upper scope.
            // It is a "target" workflow schema, where the duplicate has been saved.
            atmWorkflowSchema,
            revisionNumber,
          } = get(result, 'result') || {};
          if (atmWorkflowSchema && revisionNumber) {
            onRevisionCreated(atmWorkflowSchema, revisionNumber);
          }
        }
      });
    }
    return action;
  },

  /**
   * @private
   * @param {Number} revisionNumber
   * @returns {Utils.Action}
   */
  createDumpAtmWorkflowSchemaRevisionAction(revisionNumber) {
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
   * @param {Number} revisionNumber
   * @returns {Utils.Action}
   */
  createRemoveAtmWorkflowSchemaRevisionAction(revisionNumber) {
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
