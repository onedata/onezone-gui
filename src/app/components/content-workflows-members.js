/**
 * A members aspect of workflow directory.
 *
 * @module components/content-workflows-members
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/workflow-directory-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import PrivilegesAspectBase from 'onezone-gui/mixins/members-aspect-base';
import layout from 'onezone-gui/templates/components/-members-aspect-base';
import { Promise } from 'rsvp';

export default Component.extend(I18n, GlobalActions, PrivilegesAspectBase, {
  layout,
  classNames: ['members-aspect-base', 'content-workflows-members'],

  i18n: service(),
  navigationState: service(),
  workflowActions: service(),
  recordManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentWorkflowsMembers',

  /**
   * @override
   */
  groupedPrivilegesFlags: groupedFlags,

  /**
   * @override
   */
  modelType: 'workflowDirectory',

  /**
   * @override
   */
  record: reads('workflowDirectory'),

  /**
   * @override
   */
  async removeMember(type, member) {
    const {
      workflowActions,
      workflowDirectory,
    } = this.getProperties(
      'workflowActions',
      'workflowDirectory'
    );

    await workflowActions.removeMemberFromWorkflowDirectory(
      workflowDirectory,
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
      workflowDirectory,
    } = this.getProperties(
      'recordManager',
      'globalNotify',
      'workflowDirectory'
    );

    try {
      await Promise.all(members.map(member =>
        recordManager.removeRelation(workflowDirectory, member)
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
      workflowDirectory,
    } = this.getProperties('workflowActions', 'workflowDirectory');
    await workflowActions.createMemberGroupForWorkflowDirectory(
      workflowDirectory, {
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
      workflowDirectory,
    } = this.getProperties('workflowActions', 'workflowDirectory');
    await workflowActions.addMemberGroupToWorkflowDirectory(
      workflowDirectory,
      group
    );
  },

  /**
   * @override
   */
  async join() {
    const {
      workflowActions,
      workflowDirectory,
    } = this.getProperties('workflowActions', 'workflowDirectory');
    await workflowActions.joinWorkflowDirectoryAsUser(workflowDirectory);
  },
});
