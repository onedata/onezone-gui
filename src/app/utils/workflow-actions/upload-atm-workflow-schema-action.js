/**
 * Uploads workflow schema from JSON file. Needs `atmInventory` passed in context.
 *
 * @module utils/workflow-actions/upload-atm-workflow-schema-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import Action from 'onedata-gui-common/utils/action';
import { inject as service } from '@ember/service';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { computed, get } from '@ember/object';
import { bool, not } from 'ember-awesome-macros';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';

export default Action.extend({
  workflowManager: service(),
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.uploadAtmWorkflowSchemaAction',

  /**
   * @override
   */
  className: 'upload-atm-workflow-schema-action-trigger',

  /**
   * @override
   */
  icon: 'browser-upload',

  /**
   * @override
   */
  disabled: not('hasManageWorkflowSchemasPrivilege'),

  /**
   * @override
   */
  tip: computed(
    'hasManageWorkflowSchemasPrivilege',
    function tip() {
      const {
        i18n,
        hasManageWorkflowSchemasPrivilege,
      } = this.getProperties(
        'i18n',
        'hasManageWorkflowSchemasPrivilege'
      );

      return hasManageWorkflowSchemasPrivilege ? '' : insufficientPrivilegesMessage({
        i18n,
        modelName: 'atmInventory',
        privilegeFlag: 'atm_inventory_manage_workflow_schemas',
      });
    }
  ),

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  hasManageWorkflowSchemasPrivilege: bool('atmInventory.privileges.manageWorkflowSchemas'),

  /**
   * @override
   */
  async onExecute() {
    const {
      atmInventory,
      modalManager,
    } = this.getProperties(
      'atmInventory',
      'modalManager'
    );

    const result = ActionResult.create();
    await modalManager.show('upload-atm-workflow-schema-modal', {
      atmInventory,
      onSubmit: (data) => result.interceptPromise(this.persistDump(data)),
    }).hiddenPromise;

    result.cancelIfPending();
    return result;
  },

  /**
   * @override
   */
  getSuccessNotificationText(actionResult) {
    const operation = get(actionResult, 'result.operation');
    return this.t(`successNotificationText.${operation}`, {}, {
      defaultValue: '',
    });
  },

  /**
   * @override
   */
  getFailureNotificationActionName(actionResult) {
    const operation = get(actionResult, 'error.operation');
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
    try {
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
    } catch (error) {
      throw {
        operation,
        error,
      };
    }
    return {
      operation,
    };
  },
});
