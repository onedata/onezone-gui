/**
 * Provides workflows manipulation functions ready to use for GUI.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/i18n';
import OpenCreateAtmInventoryViewAction from 'onezone-gui/utils/workflow-actions/open-create-atm-inventory-view-action';
import CreateAtmInventoryAction from 'onezone-gui/utils/workflow-actions/create-atm-inventory-action';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import UploadAtmRecordAction from 'onezone-gui/utils/workflow-actions/upload-atm-record-action';
import DuplicateAtmRecordRevisionAction from 'onezone-gui/utils/workflow-actions/duplicate-atm-record-revision-action';
import CreateAtmLambdaAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-action';
import DumpAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-lambda-revision-action';
import CreateAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-lambda-revision-action';
import ModifyAtmLambdaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-lambda-revision-action';
import UnlinkAtmLambdaAction from 'onezone-gui/utils/workflow-actions/unlink-atm-lambda-action';
import ModifyAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-action';
import RemoveAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-action';
import CreateAtmWorkflowSchemaAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-action';
import DumpAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/dump-atm-workflow-schema-revision-action';
import CreateAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/create-atm-workflow-schema-revision-action';
import ModifyAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/modify-atm-workflow-schema-revision-action';
import RemoveAtmWorkflowSchemaRevisionAction from 'onezone-gui/utils/workflow-actions/remove-atm-workflow-schema-revision-action';
import { classify } from '@ember/string';

export default Service.extend(I18n, {
  recordManager: service(),
  workflowManager: service(),
  globalNotify: service(),
  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.workflowActions',

  /**
   * @returns {Utils.WorkflowActions.OpenCreateAtmInventoryViewAction}
   */
  createOpenCreateAtmInventoryViewAction() {
    return OpenCreateAtmInventoryViewAction.create({ ownerSource: this });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     rawAtmInventory: Object,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.CreateAtmInventoryAction}
   */
  createCreateAtmInventoryAction(context) {
    return CreateAtmInventoryAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmInventory: Models.AtmInventory,
   *     atmInventoryDiff: Object,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.ModifyAtmInventoryAction}
   */
  createModifyAtmInventoryAction(context) {
    return ModifyAtmInventoryAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmInventory: Models.AtmInventory,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.RemoveAtmInventoryAction}
   */
  createRemoveAtmInventoryAction(context) {
    return RemoveAtmInventoryAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmModelName: DumpableAtmModelName,
   *     atmInventory: Models.AtmInventory,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.UploadAtmRecordAction}
   */
  createUploadAtmRecordAction(context) {
    return UploadAtmRecordAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmModelName: DumpableAtmModelName,
   *     atmRecord: Models.AtmWorkflowSchema,
   *     revisionNumber: RevisionNumber,
   *     atmInventory: Models.AtmInventory,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.DuplicateAtmRecordRevisionAction}
   */
  createDuplicateAtmRecordRevisionAction(context) {
    return DuplicateAtmRecordRevisionAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     rawAtmLambda: Object,
   *     atmInventory: Models.AtmInventory,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.CreateAtmLambdaAction}
   */
  createCreateAtmLambdaAction(context) {
    return CreateAtmLambdaAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmLambda: Models.AtmLambda,
   *     revisionNumber: RevisionNumber,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.DumpAtmLambdaRevisionAction}
   */
  createDumpAtmLambdaRevisionAction(context) {
    return DumpAtmLambdaRevisionAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmLambda: Models.AtmLambda,
   *     revisionContent: AtmLambdaRevision,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.CreateAtmLambdaRevisionAction}
   */
  createCreateAtmLambdaRevisionAction(context) {
    return CreateAtmLambdaRevisionAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmLambda: Models.AtmLambda,
   *     revisionNumber: RevisionNumber,
   *     revisionDiff: Object,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.ModifyAtmLambdaRevisionAction}
   */
  createModifyAtmLambdaRevisionAction(context) {
    return ModifyAtmLambdaRevisionAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmLambda: Models.AtmLambda,
   *     amtInventory: Models.AtmInventory,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.UnlinkAtmLambdaAction}
   */
  createUnlinkAtmLambdaAction(context) {
    return UnlinkAtmLambdaAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmWorkflowSchema: Models.AtmWorkflowSchema,
   *     atmWorkflowSchemaDiff: Object,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.ModifyAtmWorkflowSchemaAction}
   */
  createModifyAtmWorkflowSchemaAction(context) {
    return ModifyAtmWorkflowSchemaAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmWorkflowSchema: Models.AtmWorkflowSchema,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.RemoveAtmWorkflowSchemaAction}
   */
  createRemoveAtmWorkflowSchemaAction(context) {
    return RemoveAtmWorkflowSchemaAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     rawAtmWorkflowSchema: Object,
   *     atmInventory: Models.AtmInventory,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.CreateAtmWorkflowSchemaAction}
   */
  createCreateAtmWorkflowSchemaAction(context) {
    return CreateAtmWorkflowSchemaAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmWorkflowSchema: Models.AtmWorkflowSchema,
   *     revisionNumber: RevisionNumber,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.RemoveAtmWorkflowSchemaRevisionAction}
   */
  createRemoveAtmWorkflowSchemaRevisionAction(context) {
    return RemoveAtmWorkflowSchemaRevisionAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmWorkflowSchema: Models.AtmWorkflowSchema,
   *     revisionNumber: RevisionNumber,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.DumpAtmWorkflowSchemaRevisionAction}
   */
  createDumpAtmWorkflowSchemaRevisionAction(context) {
    return DumpAtmWorkflowSchemaRevisionAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmWorkflowSchema: Models.AtmWorkflowSchema,
   *     originRevisionNumber: RevisionNumber|undefined,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.CreateAtmWorkflowSchemaRevisionAction}
   */
  createCreateAtmWorkflowSchemaRevisionAction(context) {
    return CreateAtmWorkflowSchemaRevisionAction.create({ ownerSource: this, context });
  },

  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     atmWorkflowSchema: Models.AtmWorkflowSchema,
   *     revisionNumber: RevisionNumber,
   *     revisionDiff: Object,
   *   }
   *   ```
   * @returns {Utils.WorkflowActions.ModifyAtmWorkflowSchemaRevisionAction}
   */
  createModifyAtmWorkflowSchemaRevisionAction(context) {
    return ModifyAtmWorkflowSchemaRevisionAction.create({ ownerSource: this, context });
  },

  createGlobalActions() {
    return [this.createOpenCreateAtmInventoryViewAction()];
  },

  /**
   * Joins current user to a automation inventory (without token)
   * @param {Model.AtmInventory} atmInventory
   * @returns {Promise}
   */
  joinAtmInventoryAsUser(atmInventory) {
    const {
      workflowManager,
      globalNotify,
    } = this.getProperties('workflowManager', 'globalNotify');
    return workflowManager.joinAtmInventoryAsUser(get(atmInventory, 'entityId'))
      .then(() => {
        globalNotify.info(this.t('joinedAtmInventorySuccess'));
      })
      .catch(error => {
        globalNotify.backendError(this.t('joiningAtmInventory'), error);
        throw error;
      });
  },

  /**
   * Creates member group for specified automation inventory
   * @param {Model.AtmInventory} atmInventory
   * @param {Object} groupRepresentation
   * @returns {Promise}
   */
  createMemberGroupForAtmInventory(atmInventory, groupRepresentation) {
    const {
      workflowManager,
      globalNotify,
    } = this.getProperties('workflowManager', 'globalNotify');
    return workflowManager
      .createMemberGroupForAtmInventory(
        get(atmInventory, 'entityId'),
        groupRepresentation
      ).then(() => {
        globalNotify.success(this.t('createMemberGroupSuccess', {
          memberGroupName: get(groupRepresentation, 'name'),
        }));
      }).catch(error => {
        globalNotify.backendError(this.t('creatingMemberGroup'), error);
        throw error;
      });
  },

  /**
   * Adds existing group to a automation inventory
   * @param {Model.AtmInventory} atmInventory
   * @param {Model.Group} group
   * @returns {Promise}
   */
  addMemberGroupToAtmInventory(atmInventory, group) {
    const {
      workflowManager,
      globalNotify,
    } = this.getProperties('workflowManager', 'globalNotify');
    return workflowManager.addMemberGroupToAtmInventory(
      get(atmInventory, 'entityId'),
      get(group, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('addMemberGroupSuccess', {
        memberGroupName: get(group, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('addingMemberGroup'), error);
      throw error;
    });
  },

  /**
   * Removes member from automation inventory
   * @param {AtmInventory} atmInventory
   * @param {Models.User|Models.Group} member
   */
  async removeMemberFromAtmInventory(atmInventory, member) {
    const {
      recordManager,
      globalNotify,
    } = this.getProperties('recordManager', 'globalNotify');

    const memberModelName = recordManager.getModelNameForRecord(member);
    if (!['user', 'group'].includes(memberModelName)) {
      throw new Error(
        `service:workflow-actions#removeMemberFromAtmInventory: not supported member model "${memberModelName}"`
      );
    }

    try {
      await recordManager.removeRelation(atmInventory, member);
      globalNotify.success(this.t(`remove${classify(memberModelName)}Success`, {
        atmInventoryName: get(atmInventory, 'name'),
        [`${memberModelName}Name`]: get(member, 'name'),
      }));
    } catch (error) {
      globalNotify.backendError(this.t(`${memberModelName}Deletion`), error);
      throw error;
    }
  },
});
