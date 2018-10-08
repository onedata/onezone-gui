/**
 * A members aspect of group.
 *
 * @module components/content-groups-members
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/group-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import MembersAspectBase from 'onezone-gui/mixins/members-aspect-base';
import layout from 'onezone-gui/templates/components/-members-aspect-base';

export default Component.extend(I18n, GlobalActions, MembersAspectBase, {
  layout,
  classNames: ['members-aspect-base', 'content-groups-members'],

  i18n: service(),
  navigationState: service(),
  groupActionsService: service('groupActions'),
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
  privilegeGriAspects: Object.freeze({
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
