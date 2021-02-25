/**
 * A service which provides spaces manipulation functions ready to use for GUI 
 *
 * @module services/space-actions
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { collect } from '@ember/object/computed';
import RemoveSpaceAction from 'onezone-gui/utils/space-actions/remove-space-action';
import AddHarvesterToSpaceAction from 'onezone-gui/utils/space-actions/add-harvester-to-space-action';
import RemoveHarvesterFromSpaceAction from 'onezone-gui/utils/space-actions/remove-harvester-from-space-action';

export default Service.extend(I18n, {
  router: service(),
  i18n: service(),
  spaceManager: service(),
  globalNotify: service(),
  currentUser: service(),
  guiUtils: service(),

  i18nPrefix: 'services.spaceActions',

  /**
   * @type {Ember.Computed<Array<SidebarButtonDefinition>>}
   */
  buttons: collect('btnCreate'),

  // TODO: the button should have optional link option to define a subroute
  // to go from sidebar route
  btnCreate: computed('router', function getBtnCreate() {
    const router = this.get('router');
    return {
      icon: 'add-filled',
      title: this.t('btnCreate.title'),
      tip: this.t('btnCreate.hint'),
      class: 'create-space-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'spaces', 'new'),
    };
  }),

  createRemoveSpaceAction(context) {
    return RemoveSpaceAction.create({ ownerSource: this, context });
  },

  createAddHarvesterToSpaceAction(context) {
    return AddHarvesterToSpaceAction.create({ ownerSource: this, context });
  },

  createRemoveHarvesterFromSpaceAction(context) {
    return RemoveHarvesterFromSpaceAction.create({ ownerSource: this, context });
  },

  /**
   * Creates new space
   * @returns {Promise} A promise, which resolves to new space if it has
   *    been created successfully.
   */
  createSpace({ name }) {
    const {
      globalNotify,
      router,
      spaceManager,
      guiUtils,
    } = this.getProperties(
      'globalNotify',
      'router',
      'spaceManager',
      'guiUtils',
    );
    return spaceManager.createRecord({ name })
      .catch(error => {
        globalNotify.backendError(this.t('spaceCreation'), error);
        throw error;
      })
      .then(space => {
        globalNotify.success(this.t('spaceCreateSuccess'));
        return router.transitionTo(
          'onedata.sidebar.content.aspect',
          'spaces',
          guiUtils.getRoutableIdFor(space),
          'index',
        );
      });
  },

  /**
   * Leave space
   * @param {models.Space} space
   * @returns {Promise}
   */
  leaveSpace(space) {
    const {
      spaceManager,
      globalNotify,
    } = this.getProperties('spaceManager', 'globalNotify');
    return spaceManager.leaveSpace(get(space, 'entityId'))
      .then(() => {
        globalNotify.success(this.t('spaceLeftSuccess'));
      })
      .catch(error => {
        globalNotify.backendError(this.t('leavingSpace'), error);
        throw error;
      });
  },

  /**
   * Joins user to an existing space (without token)
   * @param {Space} space
   * @returns {Promise} A promise, which resolves to space if it has
   * been joined successfully.
   */
  joinSpaceAsUser(space) {
    return this.get('spaceManager').joinSpaceAsUser(get(space, 'entityId'))
      .then(spaceRecord => {
        this.get('globalNotify').info(this.t('joinedSpaceSuccess'));
        return spaceRecord;
      })
      .catch(error => {
        this.get('globalNotify').backendError(this.t('joiningSpace'), error);
        throw error;
      });
  },

  /**
   * Creates member group for specified space
   * @param {Space} space 
   * @param {Object} groupRepresentation
   * @return {Promise}
   */
  createMemberGroup(space, groupRepresentation) {
    const {
      spaceManager,
      globalNotify,
    } = this.getProperties('spaceManager', 'globalNotify');
    return spaceManager
      .createMemberGroup(get(space, 'entityId'), groupRepresentation)
      .then(() => {
        globalNotify.success(this.t('createMemberGroupSuccess', {
          memberGroupName: get(groupRepresentation, 'name'),
        }));
      }).catch(error => {
        globalNotify.backendError(this.t('memberGroupCreation'), error);
        throw error;
      });
  },

  /**
   * Adds existing group to space
   * @param {Space} space 
   * @param {Group} group
   * @return {Promise}
   */
  addMemberGroup(space, group) {
    const {
      spaceManager,
      globalNotify,
    } = this.getProperties('spaceManager', 'globalNotify');
    return spaceManager.addMemberGroup(
      get(space, 'entityId'),
      get(group, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('addMemberGroupSuccess', {
        memberGroupName: get(group, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('memberGroupAddition'), error);
      throw error;
    });
  },

  /**
   * Removes group from space
   * @param {Space} space 
   * @param {Group} group
   * @returns {Promise}
   */
  removeGroup(space, group) {
    const {
      spaceManager,
      globalNotify,
    } = this.getProperties('spaceManager', 'globalNotify');
    const spaceEntityId = get(space, 'entityId');
    const groupEntityId = get(group, 'entityId');
    return spaceManager.removeGroupFromSpace(
      spaceEntityId,
      groupEntityId
    ).catch(error => {
      return spaceManager.leaveSpaceAsGroup(spaceEntityId, groupEntityId)
        .catch(error2 => {
          if (get(error2 || {}, 'id') !== 'forbidden') {
            console.error(error);
            throw error2;
          } else {
            throw error;
          }
        });
    }).then(() => {
      globalNotify.success(this.t('removeGroupSuccess', {
        spaceName: get(space, 'name'),
        groupName: get(group, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('groupDeletion'), error);
      throw error;
    });
  },

  /**
   * Removes user from space
   * @param {Space} space 
   * @param {User} user
   * @returns {Promise}
   */
  removeUser(space, user) {
    const {
      spaceManager,
      globalNotify,
      currentUser,
    } = this.getProperties('spaceManager', 'globalNotify', 'currentUser');
    return spaceManager.removeUserFromSpace(
      get(space, 'entityId'),
      get(user, 'entityId')
    ).catch(error => {
      if (get(currentUser, 'userId') === get(user, 'entityId')) {
        return spaceManager.leaveSpace(get(space, 'entityId')).catch(error2 => {
          if (get(error2 || {}, 'id') !== 'forbidden') {
            console.error(error);
            throw error2;
          } else {
            throw error;
          }
        });
      } else {
        throw error;
      }
    }).then(() => {
      globalNotify.success(this.t('removeUserSuccess', {
        spaceName: get(space, 'name'),
        userName: get(user, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('userDeletion'), error);
      throw error;
    });
  },
});
