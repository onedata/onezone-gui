/**
 * Duplicates workflow schema revision to another workflow schema.
 *
 * @module utils/workflow-actions/duplicate-atm-workflow-schema-revision-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import Action from 'onedata-gui-common/utils/action';
import { inject as service } from '@ember/service';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { get, set } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';

export default Action.extend({
  workflowManager: service(),
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.duplicateAtmWorkflowSchemaRevisionAction',

  /**
   * @override
   */
  className: 'duplicate-atm-workflow-schema-revision-action-trigger',

  /**
   * @override
   */
  icon: 'browser-copy',

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmWorkflowSchema: reads('context.atmWorkflowSchema'),

  /**
   * @type {ComputedProperty<number>}
   */
  revisionNumber: reads('context.revisionNumber'),

  /**
   * @override
   */
  async onExecute() {
    const {
      atmWorkflowSchema,
      modalManager,
    } = this.getProperties(
      'atmWorkflowSchema',
      'modalManager',
    );
    const result = ActionResult.create();
    const atmInventory = await get(atmWorkflowSchema, 'atmInventory');
    const dumpSourceProxy = ObjectProxy.create({
      content: {
        dump: await this.getAtmWorkflowSchemaDump(),
      },
    });

    await modalManager.show('apply-atm-workflow-schema-dump-modal', {
      initialAtmInventory: atmInventory,
      dumpSourceType: 'duplication',
      dumpSourceProxy,
      onSubmit: (data) => {
        set(result, 'additionalData', { operation: data.operation });
        return result.interceptPromise(this.persistDump(data));
      },
    }).hiddenPromise;

    result.cancelIfPending();
    return result;
  },

  async getAtmWorkflowSchemaDump() {
    const {
      revisionNumber,
      workflowManager,
    } = this.getProperties('revisionNumber', 'workflowManager');
    const atmWorkflowSchemaId = this.get('atmWorkflowSchema.entityId');

    return await workflowManager.getAtmWorkflowSchemaDump(
      atmWorkflowSchemaId,
      revisionNumber
    );
  },

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

  async persistDump({
    operation,
    atmWorkflowSchemaDump,
    targetAtmWorkflowSchema,
    newAtmWorkflowSchemaName,
  }) {
    const {
      workflowManager,
      atmInventory,
    } = this.getProperties('workflowManager', 'atmInventory');
    switch (operation) {
      case 'merge':
        await workflowManager.mergeAtmWorkflowSchemaDumpToExistingSchema(
          get(targetAtmWorkflowSchema, 'entityId'),
          atmWorkflowSchemaDump
        );
        break;
      case 'create':
        await workflowManager.createAtmWorkflowSchema(
          get(atmInventory, 'entityId'),
          Object.assign({}, atmWorkflowSchemaDump, { name: newAtmWorkflowSchemaName })
        );
    }
  },
});
