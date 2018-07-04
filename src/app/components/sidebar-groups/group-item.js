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
import { reads } from '@ember/object/computed';
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
  itemActions: computed(
    'renameAction',
    'joinSpaceAction',
    'removeAction',
    'leaveAction',
    function () {
      const {
        renameAction,
        joinSpaceAction,
        removeAction,
        leaveAction,
      } = this.getProperties(
        'renameAction',
        'joinSpaceAction',
        'removeAction',
        'leaveAction'
      );
      return [
        renameAction,
        joinSpaceAction,
        leaveAction,
        removeAction,
      ];
    }
  ),

  /**
   * If actual group disappeared from the sidebar, redirects to groups main page
   * @returns {Promise}
   */
  redirectOnGroupDeletion() {
    const {
      group,
      navigationState,
      router,
    } = this.getProperties('group', 'navigationState', 'router');
    return get(get(navigationState, 'activeResourceCollection'), 'list')
      .then(groupList => {
        const groupEntityId = get(group, 'entityId');
        const availableEntityIds = groupList.map(g => get(g, 'entityId'));
        if (availableEntityIds.indexOf(groupEntityId) === -1) {
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
        .then(() =>
          this.get('groupManager').reloadSharedGroup(get(group, 'entityId'))
        )
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
