/**
 * Provides workflows manipulation functions ready to use for GUI.
 *
 * @module services/workflow-actions
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import OpenCreateAtmInventoryViewAction from 'onezone-gui/utils/workflow-actions/open-create-atm-inventory-view-action';
import CreateAtmInventoryAction from 'onezone-gui/utils/workflow-actions/create-atm-inventory-action';
import ModifyAtmInventoryAction from 'onezone-gui/utils/workflow-actions/modify-atm-inventory-action';
import RemoveAtmInventoryAction from 'onezone-gui/utils/workflow-actions/remove-atm-inventory-action';
import { reject } from 'rsvp';
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

  createGlobalActions() {
    return [this.createOpenCreateAtmInventoryViewAction()];
  },

  /**
   * @param {Model.AtmInventory} atmInventory
   * @returns {Promise}
   */
  leaveAtmInventory(atmInventory) {
    const {
      recordManager,
      globalNotify,
    } = this.getProperties('recordManager', 'globalNotify');

    return recordManager.removeUserRelation(atmInventory)
      .then(() => {
        globalNotify.success(this.t(
          'leaveAtmInventorySuccess', {
            atmInventoryName: get(atmInventory, 'name'),
          }));
      })
      .catch(error => {
        globalNotify.backendError(this.t('leavingAtmInventory'), error);
        throw error;
      });
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
   * @return {Promise}
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
   * @return {Promise}
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
   * @returns {Promise}
   */
  async removeMemberFromAtmInventory(atmInventory, member) {
    const {
      recordManager,
      globalNotify,
    } = this.getProperties('recordManager', 'globalNotify');

    const memberModelName = recordManager.getModelNameForRecord(member);
    if (!['user', 'group'].includes(memberModelName)) {
      return reject();
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
