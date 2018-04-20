/**
 * A service which provides groups manipulation functions ready to use for gui
 *
 * @module services/group-actions
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject } from '@ember/service';
import { computed } from '@ember/object';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import $ from 'jquery';
import { next } from '@ember/runloop';

export default Service.extend(I18n, {
  router: inject(),
  i18n: inject(),
  contentResources: inject(),
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
      router,
      groupManager,
      contentResources,
    } = this.getProperties(
      'globalNotify',
      'router',
      'groupManager',
      'contentResources',
    );
    return groupManager.createRecord({
        name,
      })
      .then(group => {
        globalNotify.success(this.t('groupCreateSuccess'));
        next(() =>
          router.transitionTo(
            'onedata.sidebar.content.aspect',
            'groups',
            contentResources.getRoutableIdFor(group),
            'index',
          ).then(() => {
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
    const contentResources = this.get('contentResources');
    return this.get('groupManager').joinGroup(token)
      .then(groupRecord => {
        this.get('globalNotify').info(this.t('joinedGroupSuccess'));
        return this.get('router').transitionTo(
          'onedata.sidebar.content.aspect',
          'groups',
          contentResources.getRoutableIdFor(groupRecord),
          'index'
        );
      })
      .catch(error => {
        this.get('globalNotify').backendError(this.t('joiningGroup'), error);
      });
  },
});
