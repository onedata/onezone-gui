/**
 * A service which provides groups manipulation functions ready to use for gui
 *
 * @module services/group-actions
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject } from '@ember/service';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';
import { next } from '@ember/runloop';

export default Service.extend(I18n, {
  router: inject(),
  i18n: inject(),
  guiUtils: inject(),
  groupManager: inject(),
  globalNotify: inject(),

  i18nPrefix: 'services.groupActions',

  /**
   * @type {Ember.Computed<Array<SidebarButtonDefinition>>}
   */
  buttons: computed('btnCreate', 'btnJoin', function getButtons() {
    const {
      btnCreate,
      btnJoin,
    } = this.getProperties('btnCreate', 'btnJoin');
    return [btnCreate, btnJoin];
  }),

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
   * @type {Ember.Computed<SidebarButtonDefinition>}
   */
  btnJoin: computed('router', function getBtnCreate() {
    const router = this.get('router');
    return {
      icon: 'join-plug',
      title: this.t('btnJoin.title'),
      tip: this.t('btnJoin.hint'),
      class: 'join-group-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'groups', 'join'),
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
        next(() =>
          this.redirectToGroup(group).then(() => {
            const sidebarContainer = $('.col-sidebar');
            $('.col-sidebar').scrollTop(sidebarContainer[0].scrollHeight -
              sidebarContainer[0].clientHeight);
          })
        );
        return group;
      })
      .catch(error => globalNotify.backendError(this.t('groupCreation'), error));
  },

  /**
   * Joins to existing group using token
   * @param {string} token
   * @returns {Promise} A promise, which resolves to group if it has
   * been joined successfully.
   */
  joinGroup(token) {
    return this.get('groupManager').joinGroup(token)
      .then(groupRecord => {
        this.get('globalNotify').info(this.t('joinedGroupSuccess'));
        this.redirectToGroup(groupRecord);
        return groupRecord;
      })
      .catch(error => {
        this.get('globalNotify').backendError(this.t('joiningGroup'), error);
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
      });
  },

  /**
   * Joins group to a space using token
   * @param {Group} group 
   * @param {string} token
   * @returns {Promise<Space>}
   */
  joinSpaceAsGroup(group, token) {
    const {
      globalNotify,
      groupManager,
    } = this.getProperties('globalNotify', 'groupManager');
    return groupManager.joinSpaceAsGroup(group, token)
      .then(space => {
        globalNotify.success(this.t('joinSpaceAsGroupSuccess', {
          groupName: get(group, 'name'),
          spaceName: get(space, 'name'),
        }));
        next(() => this.redirectToGroup(group));
        return space;
      })
      .catch(error => {
        globalNotify.backendError(this.t('joiningSpaceAsGroup'), error);
        throw error;
      });
  },

  /**
   * Joins group as a subgroup
   * @param {Group} group 
   * @param {string} token
   * @param {boolean} redirect 
   * @returns {Promise<Group>} parent group
   */
  joinGroupAsSubgroup(group, token, redirect = true) {
    const {
      globalNotify,
      groupManager,
    } = this.getProperties('globalNotify', 'groupManager');
    return groupManager.joinGroupAsGroup(group, token)
      .then(parentGroup => {
        globalNotify.success(this.t('joinGroupAsSubgroupSuccess', {
          groupName: get(group, 'name'),
          parentGroupName: get(parentGroup, 'name'),
        }));
        if (redirect) {
          next(() => this.redirectToGroup(group, 'parents'));
        }
        return parentGroup;
      })
      .catch(error => {
        globalNotify.backendError(this.t('joiningGroupAsSubgroup'), error);
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
      });
  },

  /**
   * Leave group
   * @param {Group} group
   * @returns {Promise}
   */
  leaveGroup(group) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    return groupManager.leaveGroup(get(group, 'id'))
      .then(() => {
        globalNotify.success(this.t(
          'leaveGroupSuccess', { groupName: get(group, 'name') }
        ));
      })
      .catch(error => {
        globalNotify.backendError(this.t('groupLeaving'), error);
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
    return groupManager.removeGroupFromGroup(
      get(parent, 'entityId'),
      get(child, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('removeSubgroupSuccess', {
        parentGroupName: get(parent, 'name'),
        childGroupName: get(child, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('groupDeletion'), error);
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
    } = this.getProperties('groupManager', 'globalNotify');
    return groupManager.removeUserFromGroup(
      get(group, 'entityId'),
      get(user, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('removeUserSuccess', {
        groupName: get(group, 'name'),
        userName: get(user, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('userDeletion'), error);
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
    });
  },

  /**
   * Creates parent for specified child group
   * @param {Group} child 
   * @param {Object} parentRepresentation
   * @return {Promise}
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
      });
  },

  /**
   * Creates child for specified parent group
   * @param {Group} parent 
   * @param {Object} childRepresentation
   * @return {Promise}
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
      });
  },

  /**
   * Adds parent to specified child group
   * @param {Group} group 
   * @param {Object} futureParent
   * @return {Promise}
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
    });
  },

  /**
   * Adds child to specified parent group
   * @param {Group} group 
   * @param {Object} futureChild
   * @return {Promise}
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
    });
  },

  /**
   * Removes relation by combining leaving parent or (if needed) removing child
   * @param {Group} parentGroup 
   * @param {Group} childGroup 
   * @return {Promise}
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
      });
  },
});
