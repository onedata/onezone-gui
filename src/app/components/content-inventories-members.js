/**
 * A members aspect of automation inventory.
 *
 * @module components/content-inventories-members
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/atm-inventory-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import PrivilegesAspectBase from 'onezone-gui/mixins/members-aspect-base';
import layout from 'onezone-gui/templates/components/-members-aspect-base';
import { Promise } from 'rsvp';

export default Component.extend(I18n, GlobalActions, PrivilegesAspectBase, {
  layout,
  classNames: ['members-aspect-base', 'content-inventories-members'],

  i18n: service(),
  navigationState: service(),
  workflowActions: service(),
  recordManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentInventoriesMembers',

  /**
   * @override
   */
  groupedPrivilegesFlags: groupedFlags,

  /**
   * @override
   */
  modelType: 'atmInventory',

  /**
   * @override
   */
  record: reads('atmInventory'),

  /**
   * @override
   */
  async removeMember(type, member) {
    const {
      workflowActions,
      atmInventory,
    } = this.getProperties(
      'workflowActions',
      'atmInventory'
    );

    await workflowActions.removeMemberFromAtmInventory(
      atmInventory,
      member
    );
  },

  /**
   * @override
   */
  async removeMembers(members) {
    const {
      recordManager,
      globalNotify,
      atmInventory,
    } = this.getProperties(
      'recordManager',
      'globalNotify',
      'atmInventory'
    );

    try {
      await Promise.all(members.map(member =>
        recordManager.removeRelation(atmInventory, member)
      ));
      globalNotify.success(this.t('removeMembersSuccess'));
    } catch (error) {
      globalNotify.backendError(this.t('membersDeletion'), error);
      throw error;
    }
  },

  /**
   * @override
   */
  async createChildGroup(name) {
    const {
      workflowActions,
      atmInventory,
    } = this.getProperties('workflowActions', 'atmInventory');
    await workflowActions.createMemberGroupForAtmInventory(
      atmInventory, {
        name,
      }
    );
  },

  /**
   * @override
   */
  async addMemberGroup(group) {
    const {
      workflowActions,
      atmInventory,
    } = this.getProperties('workflowActions', 'atmInventory');
    await workflowActions.addMemberGroupToAtmInventory(
      atmInventory,
      group
    );
  },

  /**
   * @override
   */
  async join() {
    const {
      workflowActions,
      atmInventory,
    } = this.getProperties('workflowActions', 'atmInventory');
    await workflowActions.joinAtmInventoryAsUser(atmInventory);
  },
});
