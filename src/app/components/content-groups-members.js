/**
 * A members aspect of group.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import MembersAspectBase from 'onezone-gui/mixins/members-aspect-base';
import layout from 'onezone-gui/templates/components/-members-aspect-base';
import { Promise } from 'rsvp';

export default Component.extend(I18n, GlobalActions, MembersAspectBase, {
  layout,
  classNames: ['members-aspect-base', 'content-groups-members'],

  i18n: service(),
  navigationState: service(),
  groupActionsService: service('groupActions'),
  groupManager: service(),
  globalNotify: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsMembers',

  /**
   * @override
   */
  groupedPrivilegesFlags: groupedFlags,

  /**
   * @override
   */
  griAspects: Object.freeze({
    user: 'user',
    group: 'child',
  }),

  /**
   * @override
   */
  modelType: 'group',

  /**
   * @override
   */
  record: reads('group'),

  /**
   * @override
   */
  removeMember(type, member) {
    const {
      groupActionsService,
      group,
    } = this.getProperties(
      'groupActionsService',
      'group',
    );
    return type === 'group' ?
      groupActionsService.removeChildGroup(group, member) :
      groupActionsService.removeUser(group, member);
  },

  /**
   * @override
   */
  removeMembers(members) {
    const {
      groupManager,
      globalNotify,
      group,
    } = this.getProperties(
      'groupManager',
      'globalNotify',
      'group'
    );

    const groupEntityId = get(group, 'entityId');
    const promise = Promise.all(members.map(member => {
      const memberEntityId = get(member, 'entityId');
      if (get(member, 'entityType') === 'user') {
        return groupManager.removeUserFromGroup(
          groupEntityId,
          memberEntityId
        );
      } else {
        return groupManager.removeGroupFromGroup(
          groupEntityId,
          memberEntityId
        );
      }
    }));
    return promise.then(() => {
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
      groupActionsService,
      group,
    } = this.getProperties('groupActionsService', 'group');
    return groupActionsService.createChild(group, { name });
  },

  /**
   * @override
   */
  addMemberGroup(group) {
    const {
      groupActionsService,
      group: parentGroup,
    } = this.getProperties('groupActionsService', 'group');
    return groupActionsService.addChild(parentGroup, group);
  },

  /**
   * @override
   */
  join() {
    const {
      group,
      groupActionsService,
    } = this.getProperties('group', 'groupActionsService');
    return groupActionsService.joinGroupAsUser(group);
  },
});
