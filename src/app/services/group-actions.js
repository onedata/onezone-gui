/**
 * A service which provides groups manipulation functions ready to use for gui
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject } from '@ember/service';
import { collect } from '@ember/object/computed';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';

export default Service.extend(I18n, {
  router: inject(),
  i18n: inject(),
  guiUtils: inject(),
  groupManager: inject(),
  globalNotify: inject(),
  currentUser: inject(),

  i18nPrefix: 'services.groupActions',

  /**
   * @type {Ember.Computed<Array<SidebarButtonDefinition>>}
   */
  buttons: collect('btnCreate'),

  /**
   * @type {Ember.Computed<SidebarButtonDefinition>}
   */
  btnCreate: computed('router', function getBtnCreate() {
    const router = this.get('router');
    return {
      icon: 'add-filled',
      title: this.t('btnCreate.title'),
      tip: this.t('btnCreate.hint'),
      class: 'create-group-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'groups', 'new'),
    };
  }),

  /**
   * Creates new group
   * @returns {Promise} A promise, which resolves to new group if it has
   * been created successfully.
   */
  createGroup({ name }) {
    const {
      globalNotify,
      groupManager,
    } = this.getProperties(
      'globalNotify',
      'groupManager',
    );
    return groupManager.createGroup({
        name,
      })
      .then(group => {
        globalNotify.success(this.t('groupCreateSuccess'));
        next(() => this.redirectToGroup(group));
        return group;
      })
      .catch(error => {
        globalNotify.backendError(this.t('groupCreation'), error);
        throw error;
      });
  },

  /**
   * Joins user to an existing group (without token)
   * @param {Group} group
   * @returns {Promise} A promise, which resolves to group if it has
   * been joined successfully.
   */
  joinGroupAsUser(group) {
    return this.get('groupManager').joinGroupAsUser(get(group, 'entityId'))
      .then(groupRecord => {
        this.get('globalNotify').info(this.t('joinedGroupSuccess'));
        return groupRecord;
      })
      .catch(error => {
        this.get('globalNotify').backendError(this.t('joiningGroup'), error);
        throw error;
      });
  },

  /**
   * Deletes group
   * @param {Group} group
   * @returns {Promise}
   */
  deleteGroup(group) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    return groupManager.deleteGroup(get(group, 'id'))
      .then(() => {
        globalNotify.success(this.t(
          'deleteGroupSuccess', { groupName: get(group, 'name') }
        ));
      })
      .catch(error => {
        group.rollbackAttributes();
        globalNotify.backendError(this.t('groupDeletion'), error);
        throw error;
      });
  },

  /**
   * Redirects to group page
   * @param {Group} group
   * @param {string} aspect
   * @returns {Promise}
   */
  redirectToGroup(group, aspect = 'members') {
    const {
      router,
      guiUtils,
    } = this.getProperties('router', 'guiUtils');
    return router.transitionTo(
      'onedata.sidebar.content.aspect',
      'groups',
      guiUtils.getRoutableIdFor(group),
      aspect,
    );
  },

  /**
   * Removes subgroup from group
   * @param {Group} parent
   * @param {Group} child
   * @returns {Promise}
   */
  removeChildGroup(parent, child) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    const parentEntityId = get(parent, 'entityId');
    const childEntityId = get(child, 'entityId');
    return groupManager.removeGroupFromGroup(
      parentEntityId,
      childEntityId
    ).catch(() =>
      groupManager.leaveGroupAsGroup(parentEntityId, childEntityId)
    ).then(() => globalNotify.success(this.t('removeSubgroupSuccess', {
      parentGroupName: get(parent, 'name'),
      childGroupName: get(child, 'name'),
    }))).catch(error => {
      globalNotify.backendError(this.t('groupDeletion'), error);
      throw error;
    });
  },

  /**
   * Removes user from group
   * @param {Group} group
   * @param {User} user
   * @returns {Promise}
   */
  removeUser(group, user) {
    const {
      groupManager,
      globalNotify,
      currentUser,
    } = this.getProperties('groupManager', 'globalNotify', 'currentUser');
    return groupManager.removeUserFromGroup(
      get(group, 'entityId'),
      get(user, 'entityId')
    ).catch((error) => {
      if (get(currentUser, 'userId') === get(user, 'entityId')) {
        return groupManager.leaveGroup(get(group, 'id')).catch(error2 => {
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
        groupName: get(group, 'name'),
        userName: get(user, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('userDeletion'), error);
      throw error;
    });
  },

  /**
   * Leaves from parent group
   * @param {Group} parent
   * @param {Group} child
   * @returns {Promise}
   */
  leaveParentGroup(parent, child) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    return groupManager.leaveGroupAsGroup(
      get(parent, 'entityId'),
      get(child, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('leaveGroupSuccess', {
        groupName: get(parent, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('groupLeaving'), error);
      throw error;
    });
  },

  /**
   * Creates parent for specified child group
   * @param {Group} child
   * @param {Object} parentRepresentation
   * @returns {Promise}
   */
  createParent(child, parentRepresentation) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    return groupManager.createParent(get(child, 'entityId'), parentRepresentation)
      .then(() => {
        globalNotify.success(this.t('createParentGroupSuccess', {
          parentGroupName: get(parentRepresentation, 'name'),
        }));
      }).catch(error => {
        globalNotify.backendError(this.t('parentGroupCreation'), error);
        throw error;
      });
  },

  /**
   * Creates child for specified parent group
   * @param {Group} parent
   * @param {Object} childRepresentation
   * @returns {Promise}
   */
  createChild(parent, childRepresentation) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    return groupManager.createChild(get(parent, 'entityId'), childRepresentation)
      .then(() => {
        globalNotify.success(this.t('createChildGroupSuccess', {
          childGroupName: get(childRepresentation, 'name'),
        }));
      }).catch(error => {
        globalNotify.backendError(this.t('childGroupCreation'), error);
        throw error;
      });
  },

  /**
   * Adds parent to specified child group
   * @param {Group} group
   * @param {Object} futureParent
   * @returns {Promise}
   */
  addParent(group, futureParent) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    return groupManager.addChild(
      get(futureParent, 'entityId'),
      get(group, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('addParentGroupSuccess', {
        parentGroupName: get(futureParent, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('parentGroupAddition'), error);
      throw error;
    });
  },

  /**
   * Adds child to specified parent group
   * @param {Group} group
   * @param {Group} futureChild
   * @returns {Promise}
   */
  addChild(group, futureChild) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    return groupManager.addChild(
      get(group, 'entityId'),
      get(futureChild, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('addChildGroupSuccess', {
        childGroupName: get(futureChild, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('childGroupAddition'), error);
      throw error;
    });
  },

  /**
   * Removes relation by combining leaving parent or (if needed) removing child
   * @param {Group} parentGroup
   * @param {Group} childGroup
   * @returns {Promise}
   */
  removeRelation(parentGroup, childGroup) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    const parentEntityId = get(parentGroup, 'entityId');
    const childEntityId = get(childGroup, 'entityId');
    return groupManager.leaveGroupAsGroup(parentEntityId, childEntityId)
      .catch(() =>
        groupManager.removeGroupFromGroup(parentEntityId, childEntityId)
      )
      .then(() => globalNotify.success(this.t('removeRelationSuccess', {
        parentGroupName: get(parentGroup, 'name'),
        childGroupName: get(childGroup, 'name'),
      })))
      .catch(error => {
        globalNotify.backendError(this.t('groupLeaving'), error);
        throw error;
      });
  },
});
