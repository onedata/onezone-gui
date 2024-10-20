/**
 * A first-level item component for groups sidebar
 *
 * @author Michał Borzęcki, Agnieszka Warchoł
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { next } from '@ember/runloop';
import { reads, collect } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';
import { reject, resolve } from 'rsvp';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  globalNotify: service(),
  groupActions: service(),
  router: service(),
  navigationState: service(),
  clipboardActions: service(),
  userActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarGroups.groupItem',

  /**
   * @virtual optional
   * @type {boolean}
   */
  inSidenav: false,

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
   * @type {Ember.ComputedProperty<Group>}
   */
  group: reads('item'),

  /**
   * @type {ComputedProperty<Record<string, Utils.Action>>}
   */
  actionsCache: computed(() => ({})),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    return {
      action: () => this.send('toggleRename', true),
      title: this.t('rename'),
      class: 'rename-group-action',
      icon: 'browser-rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  leaveAction: computed('group', function leaveAction() {
    this.actionsCache.leaveAction?.destroyAfterAllExecutions();
    const action = this.userActions.createLeaveAction({
      recordToLeave: this.group,
    });
    set(action, 'className', `${action.className} leave-group-action`);
    this.actionsCache.leaveAction = action;
    return action;
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed(function removeAction() {
    return {
      action: () => this.send('showRemoveModal'),
      title: this.t('remove'),
      class: 'remove-group-action',
      icon: 'browser-delete',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed('group', function copyIdAction() {
    this.actionsCache.copyIdAction?.destroyAfterAllExecutions();
    const {
      group,
      clipboardActions,
    } = this.getProperties('group', 'clipboardActions');

    return this.actionsCache.copyIdAction =
      clipboardActions.createCopyRecordIdAction({ record: group });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  itemActions: collect(
    'renameAction',
    'removeAction',
    'leaveAction',
    'copyIdAction'
  ),

  /**
   * @override
   */
  willDestroyElement() {
    try {
      [
        'leaveAction',
        'copyIdAction',
      ].forEach((action) => this.cacheFor(action)?.destroyAfterAllExecutions());
    } finally {
      this._super(...arguments);
    }
  },

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
      if (oldName === name) {
        this.send('toggleRename', false);
        return resolve();
      }
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
  },
});
