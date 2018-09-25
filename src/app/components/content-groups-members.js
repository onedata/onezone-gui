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
import PrivilegesAspectBase from 'onezone-gui/mixins/privileges-aspect-base';
import layout from 'onezone-gui/templates/components/-privileges-aspect-base';

export default Component.extend(I18n, GlobalActions, PrivilegesAspectBase, {
  layout,
  classNames: ['privileges-aspect-base', 'content-groups-members'],

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
});
