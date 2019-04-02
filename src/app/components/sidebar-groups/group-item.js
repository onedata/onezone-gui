/**
 * A first-level item component for groups sidebar
 *
 * @module components/sidebar-groups/group-item
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { next } from '@ember/runloop';
import { reads, collect } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reject } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  globalNotify: service(),
  groupActions: service(),
  groupManager: service(),
  router: service(),
  guiUtils: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarGroups.groupItem',

  /**
   * @type {boolean}
   */
  isRenaming: false,

  /**
   * @type {boolean}
   */
  removeGroupModalOpen: false,

  /**
   * @type {boolean}
   */
  isRemoving: false,

  /**
   * @type {boolean}
   */
  leaveGroupModalOpen: false,

  /**
   * @type {boolean}
   */
  isLeaving: false,

  /**
   * @type {Ember.ComputedProperty<Group>}
   */
  group: reads('item'),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function () {
    return {
      action: () => this.send('toggleRename', true),
      title: this.t('rename'),
      class: 'rename-group-action',
      icon: 'rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  joinSpaceAction: computed(function () {
    const {
      router,
      guiUtils,
      group,
    } = this.getProperties('router', 'guiUtils', 'group');
    return {
      action: () => router.transitionTo(
        'onedata.sidebar.content.aspect',
        guiUtils.getRoutableIdFor(group),
        'join-space'
      ),
      title: this.t('joinSpace'),
      class: 'join-space-action',
      icon: 'space-join',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  joinHarvesterAction: computed(function joinHarvesterAction() {
    const {
      router,
      guiUtils,
      group,
    } = this.getProperties('router', 'guiUtils', 'group');
    return {
      action: () => router.transitionTo(
        'onedata.sidebar.content.aspect',
        guiUtils.getRoutableIdFor(group),
        'join-harvester'
      ),
      title: this.t('joinHarvester'),
      class: 'join-harvester-action',
      icon: 'light-bulb',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  joinAsSubgroupAction: computed(function () {
    const {
      router,
      guiUtils,
      group,
    } = this.getProperties('router', 'guiUtils', 'group');
    return {
      action: () => router.transitionTo(
        'onedata.sidebar.content.aspect',
        guiUtils.getRoutableIdFor(group),
        'join-as-subgroup'
      ),
      title: this.t('joinAsSubgroup'),
      class: 'join-as-subgroup-action',
      icon: 'join-plug',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  joinClusterAction: computed(function joinClusterAction() {
    const {
      router,
      guiUtils,
      group,
    } = this.getProperties('router', 'guiUtils', 'group');
    return {
      action: () => router.transitionTo(
        'onedata.sidebar.content.aspect',
        guiUtils.getRoutableIdFor(group),
        'join-cluster'
      ),
      title: this.t('joinCluster'),
      class: 'join-cluster-action',
      icon: 'cluster',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  leaveAction: computed(function () {
    return {
      action: () => this.send('showLeaveModal'),
      title: this.t('leave'),
      class: 'leave-group-action',
      icon: 'group-leave-group',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed(function () {
    return {
      action: () => this.send('showRemoveModal'),
      title: this.t('remove'),
      class: 'remove-group-action',
      icon: 'remove',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  itemActions: collect(
    'renameAction',
    'joinSpaceAction',
    'joinHarvesterAction',
    'joinAsSubgroupAction',
    'joinClusterAction',
    'removeAction',
    'leaveAction'
  ),

  /**
   * If actual group disappeared from the sidebar, redirects to groups main page
   * @returns {Promise}
   */
  redirectOnGroupDeletion() {
    const {
      navigationState,
      router,
    } = this.getProperties('navigationState', 'router');
    const groupId = get(navigationState, 'activeResource.id');
    return navigationState
      .resourceCollectionContainsId(groupId)
      .then(contains => {
        if (!contains) {
          next(() => router.transitionTo('onedata.sidebar', 'groups'));
        }
      });
  },

  actions: {
    editorClick(event) {
      if (this.get('isRenaming')) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    toggleRename(value) {
      next(() => safeExec(this, 'set', 'isRenaming', value));
    },
    rename(name) {
      if (!name || !name.length) {
        return reject();
      }

      const {
        group,
        globalNotify,
      } = this.getProperties('group', 'globalNotify');

      const oldName = get(group, 'name');
      set(group, 'name', name);
      return group.save()
        .then(() => {
          this.send('toggleRename', false);
        })
        .catch((error) => {
          globalNotify.backendError(this.t('groupPersistence'), error);
          // Restore old group name
          set(group, 'name', oldName);
          throw error;
        });
    },
    showRemoveModal() {
      this.set('removeGroupModalOpen', true);
    },
    closeRemoveModal() {
      this.set('removeGroupModalOpen', false);
    },
    remove() {
      const {
        group,
        groupActions,
      } = this.getProperties('group', 'groupActions');
      this.set('isRemoving', true);
      return groupActions.deleteGroup(group)
        .then(() => this.redirectOnGroupDeletion())
        .finally(() => {
          safeExec(this, 'setProperties', {
            isRemoving: false,
            removeGroupModalOpen: false,
          });
        });
    },
    showLeaveModal() {
      this.set('leaveGroupModalOpen', true);
    },
    closeLeaveModal() {
      this.set('leaveGroupModalOpen', false);
    },
    leave() {
      const {
        group,
        groupActions,
      } = this.getProperties('group', 'groupActions');
      this.set('isLeaving', true);
      return groupActions.leaveGroup(group)
        .then(() => this.redirectOnGroupDeletion())
        .finally(() =>
          safeExec(this, 'setProperties', {
            isLeaving: false,
            leaveGroupModalOpen: false,
          })
        );
    },
  },
});
