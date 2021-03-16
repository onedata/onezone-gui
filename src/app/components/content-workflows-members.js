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
import { get } from '@ember/object';
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
  workflowManager: service(),
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
  removeMember(type, member) {
    const {
      harvesterActions,
      harvester,
    } = this.getProperties(
      'harvesterActions',
      'harvester'
    );
    return type === 'group' ?
      harvesterActions.removeGroupFromHarvester(harvester, member) :
      harvesterActions.removeUserFromHarvester(harvester, member);
  },

  /**
   * @override
   */
  removeMembers(members) {
    const {
      harvesterManager,
      globalNotify,
      harvester,
    } = this.getProperties(
      'harvesterManager',
      'globalNotify',
      'harvester'
    );

    const harvesterEntityId = get(harvester, 'entityId');
    return Promise.all(members.map(member => {
        const memberEntityId = get(member, 'entityId');
        if (get(member, 'entityType') === 'user') {
          return harvesterManager.removeUserFromHarvester(
            harvesterEntityId,
            memberEntityId
          );
        } else {
          return harvesterManager.removeGroupFromHarvester(
            harvesterEntityId,
            memberEntityId
          );
        }
      }))
      .then(() => {
        globalNotify.success(this.t('removeMembersSuccess'));
      }).catch(error => {
        globalNotify.backendError(this.t('membersDeletion'), error);
        throw error;
      });
  },

  /**
   * @override
   */
  createChildGroup(name) {
    const {
      harvesterActions,
      harvester,
    } = this.getProperties('harvesterActions', 'harvester');
    return harvesterActions.createMemberGroupForHarvester(harvester, { name });
  },

  /**
   * @override
   */
  addMemberGroup(group) {
    const {
      harvesterActions,
      harvester,
    } = this.getProperties('harvesterActions', 'harvester');
    return harvesterActions.addMemberGroupToHarvester(harvester, group);
  },

  /**
   * @override
   */
  join() {
    const {
      harvesterActions,
      harvester,
    } = this.getProperties('harvesterActions', 'harvester');
    return harvesterActions.joinHarvesterAsUser(harvester);
  },
});
