/**
 * A members aspect of space.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/space-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import MembersAspectBase from 'onezone-gui/mixins/members-aspect-base';
import layout from 'onezone-gui/templates/components/-members-aspect-base';
import { Promise } from 'rsvp';
import { computedRelationProxy } from 'onedata-gui-websocket-client/mixins/models/graph-single-model';

export default Component.extend(I18n, GlobalActions, MembersAspectBase, {
  layout,
  classNames: ['members-aspect-base', 'content-spaces-members'],

  i18n: service(),
  spaceActions: service(),
  spaceManager: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMembers',

  /**
   * @override
   */
  modelSupportsOwners: true,

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
   * @implements {Mixins.MembersAspectBase}
   */
  ownersListProxy: computedRelationProxy('record', 'ownerList'),

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
  removeMembers(members) {
    const {
      spaceManager,
      globalNotify,
      space,
    } = this.getProperties(
      'spaceManager',
      'globalNotify',
      'space'
    );

    const spaceEntityId = get(space, 'entityId');
    const promise = Promise.all(members.map(member => {
      const memberEntityId = get(member, 'entityId');
      if (get(member, 'entityType') === 'user') {
        return spaceManager.removeUserFromSpace(
          spaceEntityId,
          memberEntityId
        );
      } else {
        return spaceManager.removeGroupFromSpace(
          spaceEntityId,
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

  /**
   * @override
   */
  join() {
    const {
      space,
      spaceActions,
    } = this.getProperties('space', 'spaceActions');
    return spaceActions.joinSpaceAsUser(space);
  },
});
