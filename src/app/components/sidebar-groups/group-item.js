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
  groupManager: service(),

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
    'removeAction',
    'leaveAction',
    function () {
      const {
        renameAction,
        removeAction,
        leaveAction,
      } = this.getProperties('renameAction', 'removeAction', 'leaveAction');
      return [renameAction, leaveAction, removeAction];
    }
  ),

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
        groupManager,
        globalNotify,
      } = this.getProperties('group', 'groupManager', 'globalNotify');
      this.set('isRemoving', true);
      return groupManager.deleteRecord(get(group, 'id')).finally(() => {
        safeExec(this, 'setProperties', {
          isRemoving: false,
          removeGroupModalOpen: false,
        });
      })
      .catch(error => {
        globalNotify.backendError(this.t('groupDeletion'), error);
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
        groupManager,
        globalNotify,
      } = this.getProperties('group', 'groupManager', 'globalNotify');
      this.set('isLeaving', true);
      return groupManager.leaveGroup(get(group, 'id')).finally(() => {
        safeExec(this, 'setProperties', {
          isLeaving: false,
          leaveGroupModalOpen: false,
        });
      })
      .catch(error => {
        globalNotify.backendError(this.t('groupLeaving'), error);
      });
    },
  },
});
