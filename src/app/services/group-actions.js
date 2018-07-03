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
    return groupManager.createRecord({
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
   * Joins group to a space using token
   * @param {Group} group 
   * @param {string} token
   * @returns {Promise<Space>}
   */
  joinGroupToSpace(group, token) {
    const {
      globalNotify,
      groupManager,
    } = this.getProperties('globalNotify', 'groupManager');
    return groupManager.joinGroupToSpace(group, token)
      .then(space => {
        globalNotify.success(this.t('joinGroupToSpaceSuccess', {
          groupName: get(group, 'name'),
          spaceName: get(space, 'name'),
        }));
        next(() => this.redirectToGroup(group));
        return space;
      })
      .catch(error => {
        globalNotify.backendError(this.t('joiningGroupToSpace'), error);
        throw error;
      });
  },

  /**
   * Joins group as a subgroup
   * @param {Group} group 
   * @param {string} token
   * @returns {Promise<Group>} parent group
   */
  joinGroupAsSubgroup(group, token) {
    const {
      globalNotify,
      groupManager,
    } = this.getProperties('globalNotify', 'groupManager');
    return groupManager.joinGroupAsSubgroup(group, token)
      .then(parentGroup => {
        globalNotify.success(this.t('joinGroupAsSubgroupSuccess', {
          groupName: get(group, 'name'),
          parentGroupName: get(parentGroup, 'name'),
        }));
        next(() => this.redirectToGroup(group));
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
    this.set('isRemoving', true);
    return groupManager.deleteRecord(get(group, 'id'))
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
    this.set('isRemoving', true);
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
   * @returns {Promise}
   */
  redirectToGroup(group) {
    const {
      router,
      guiUtils,
    } = this.getProperties('router', 'guiUtils');
    return router.transitionTo(
      'onedata.sidebar.content.aspect',
      'groups',
      guiUtils.getRoutableIdFor(group),
      'index',
    );
  },

  /**
   * Removes subgroup from group
   * @param {Group|SharedGroup} parent 
   * @param {Group|SharedGroup} child
   * @returns {Promise}
   */
  removeSubgroupFromGroup(parent, child) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    this.set('isRemoving', true);
    return groupManager.removeGroupFromParentGroup(
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
   * @param {Group|SharedGroup} group 
   * @param {User|SharedUser} user
   * @returns {Promise}
   */
  removeUserFromGroup(group, user) {
    const {
      groupManager,
      globalNotify,
    } = this.getProperties('groupManager', 'globalNotify');
    this.set('isRemoving', true);
    return groupManager.removeUserFromParentGroup(
      get(group, 'entityId'),
      get(user, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('removeUserFromGroupSuccess', {
        groupName: get(group, 'name'),
        userName: get(user, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('userDeletion'), error);
    });
  },
});
