/**
 * A members aspect of space.
 *
 * @module components/content-spaces-members
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import PrivilegesAspectBase from 'onezone-gui/mixins/members-aspect-base';
import layout from 'onezone-gui/templates/components/-members-aspect-base';

export default Component.extend(I18n, GlobalActions, PrivilegesAspectBase, {
  layout,
  classNames: ['members-aspect-base', 'content-spaces-members'],

  i18n: service(),
  navigationState: service(),
  spaceActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMembers',

  /**
   * @override
   */
  groupedPrivilegesFlags: groupedFlags,

  /**
   * @override
   */
  modelType: 'space',

  /**
   * @override
   */
  record: reads('space'),

  /**
   * @override
   */
  removeMember(type, member) {
    const {
      spaceActions,
      space,
    } = this.getProperties(
      'spaceActions',
      'space',
    );
    return type === 'group' ?
      spaceActions.removeGroup(space, member) :
      spaceActions.removeUser(space, member);
  },

  /**
   * @override
   */
  createChildGroup(name) {
    const {
      spaceActions,
      space,
    } = this.getProperties('spaceActions', 'space');
    return spaceActions.createMemberGroup(space, { name });
  },

  /**
   * @override
   */
  addMemberGroup(group) {
    const {
      spaceActions,
      space,
    } = this.getProperties('spaceActions', 'space');
    return spaceActions.addMemberGroup(space, group);
  },
});
