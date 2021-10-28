/**
 * Base class, that should be extended by actions working with application of
 * workflow schema dump and apply-atm-workflow-schema-dump modal
 *
 * @module utils/workflow-actions/apply-atm-workflow-schema-dump-action-base
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  getSuccessNotificationText(actionResult) {
    const operation = get(actionResult, 'additionalData.operation');
    return this.t(`successNotificationText.${operation}`, {}, {
      defaultValue: '',
    });
  },

  /**
   * @override
   */
  getFailureNotificationActionName(actionResult) {
    const operation = get(actionResult, 'additionalData.operation');
    return this.t(`failureNotificationActionName.${operation}`, {}, {
      defaultValue: '',
    });
  },

  handleModalSubmit(modalSubmitData, actionResult) {
    set(actionResult, 'additionalData', { operation: modalSubmitData.operation });
    return actionResult.interceptPromise(this.persistDump(modalSubmitData));
  },

  async persistDump({
    operation,
    atmInventory,
    atmWorkflowSchemaDump,
    targetAtmWorkflowSchema,
    newAtmWorkflowSchemaName,
  }) {
    const workflowManager = this.get('workflowManager');
    const revisionNumber =
      get(atmWorkflowSchemaDump, 'initialRevision.originalRevisionNumber');
    let atmWorkflowSchema;
    switch (operation) {
      case 'merge':
        atmWorkflowSchema =
          await workflowManager.mergeAtmWorkflowSchemaDumpToExistingSchema(
            get(targetAtmWorkflowSchema, 'entityId'),
            atmWorkflowSchemaDump
          );
        break;
      case 'create':
        atmWorkflowSchema = await workflowManager.createAtmWorkflowSchema(
          get(atmInventory, 'entityId'),
          Object.assign({}, atmWorkflowSchemaDump, { name: newAtmWorkflowSchemaName })
        );
        break;
    }
    return {
      atmWorkflowSchema,
      revisionNumber,
    };
  },
});
