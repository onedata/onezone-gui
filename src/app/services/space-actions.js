/**
 * A service which provides spaces manipulation functions ready to use for GUI 
 *
 * @module services/space-actions
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { computed, get } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';

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
  buttons: computed('btnCreate', 'btnJoin', function getButtons() {
    const {
      btnCreate,
      btnJoin,
    } = this.getProperties('btnCreate', 'btnJoin');
    return [btnCreate, btnJoin];
  }),

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

  btnJoin: computed('router', function getBtnCreate() {
    const router = this.get('router');
    return {
      icon: 'join-plug',
      title: this.t('btnJoin.title'),
      tip: this.t('btnJoin.hint'),
      class: 'join-space-btn',
      action: () => router.transitionTo('onedata.sidebar.content', 'spaces', 'join'),
    };
  }),

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
    return spaceManager.createRecord({
        name,
      })
      .then(space => {
        globalNotify.success(this.t('spaceCreateSuccess'));
        return router.transitionTo(
          'onedata.sidebar.content.aspect',
          'spaces',
          guiUtils.getRoutableIdFor(space),
          'index',
        ).then(() => {
          const sidebarContainer = $('.col-sidebar');
          $('.col-sidebar').scrollTop(sidebarContainer[0].scrollHeight -
            sidebarContainer[0].clientHeight);
        });
      })
      .catch(error => {
        globalNotify.backendError(this.t('spaceCreation'), error);
        throw error;
      });
  },

  /**
   * Joins a space
   * @param {string} token an invitation token
   * @returns {Promise} A promise of transition into view of newly joined space
   */
  joinSpace(token) {
    const guiUtils = this.get('guiUtils');
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.joinSpace(token))
      .then(spaceRecord =>
        spaceRecord.reloadList('userList').then(() => spaceRecord)
      )
      .then(spaceRecord => {
        this.get('globalNotify').info(this.t('joinedSpaceSuccess'));
        return this.get('router').transitionTo(
          'onedata.sidebar.content.aspect',
          guiUtils.getRoutableIdFor(spaceRecord),
          'index',
        );
      })
      .catch(error => {
        this.get('globalNotify').backendError(this.t('joiningSpace'), error);
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
    return spaceManager.removeGroupFromSpace(
      get(space, 'entityId'),
      get(group, 'entityId')
    ).then(() => {
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
    } = this.getProperties('spaceManager', 'globalNotify');
    return spaceManager.removeUserFromSpace(
      get(space, 'entityId'),
      get(user, 'entityId')
    ).then(() => {
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
