/**
 * A first-level item component for automation inventories sidebar.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set, trySet } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/i18n';

// TODO: VFS-7655 Better inventory icon - now it is too light comparing to other,
// bolder icons

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  workflowActions: service(),
  clipboardActions: service(),
  navigationState: service(),
  userActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarAtmInventories.atmInventoryItem',

  /**
   * @type {Models.AtmInventory}
   */
  item: undefined,

  /**
   * @virtual optional
   * @type {Boolean}
   */
  inSidenav: false,

  /**
   * @type {Boolean}
   */
  isRenaming: false,

  /**
   * Alias for `item` to make code more verbose
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('item'),

  /**
   * @type {ComputedProperty<Record<string, Utils.Action>>}
   */
  actionsCache: computed(() => ({})),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    return {
      action: () => this.toggleRename(true),
      title: this.t('actions.rename.title'),
      className: 'rename-atm-inventory-action-trigger',
      icon: 'browser-rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  leaveAction: computed('atmInventory', function leaveAction() {
    this.actionsCache.leaveAction?.destroyAfterAllExecutions();
    const action = this.userActions.createLeaveAction({
      recordToLeave: this.atmInventory,
    });
    set(action, 'className', `${action.className} leave-atm-inventory-action-trigger`);
    return this.actionsCache.leaveAction = action;
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed('atmInventory', function removeAction() {
    this.actionsCache.removeAction?.destroyAfterAllExecutions();
    const {
      atmInventory,
      workflowActions,
    } = this.getProperties('atmInventory', 'workflowActions');
    return this.actionsCache.removeAction =
      workflowActions.createRemoveAtmInventoryAction({
        atmInventory,
      });
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed('atmInventory', function copyIdAction() {
    this.actionsCache.copyIdAction?.destroyAfterAllExecutions();
    const {
      atmInventory,
      clipboardActions,
    } = this.getProperties('atmInventory', 'clipboardActions');

    return this.actionsCache.copyIdAction =
      clipboardActions.createCopyRecordIdAction({ record: atmInventory });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  itemActions: collect(
    'renameAction',
    'leaveAction',
    'removeAction',
    'copyIdAction'
  ),

  willDestroyElement() {
    try {
      [
        'leaveAction',
        'removeAction',
        'copyIdAction',
      ].forEach((action) => this.cacheFor(action)?.destroyAfterAllExecutions());
    } finally {
      this._super(...arguments);
    }
  },

  toggleRename(value) {
    trySet(this, 'isRenaming', value);
  },

  actions: {
    toggleRename(value) {
      this.toggleRename(value);
    },
    editorClick(event) {
      if (this.get('isRenaming')) {
        event.stopPropagation();
        event.preventDefault();
      }
    },
    async rename(name) {
      if (!name || !name.length) {
        throw new Error('atm-inventory-item#rename: no name provided');
      }

      const {
        atmInventory,
        workflowActions,
      } = this;

      const oldName = get(atmInventory, 'name');
      if (oldName === name) {
        this.toggleRename(false);
        return;
      }

      const atmInventoryDiff = { name };
      const action = workflowActions.createModifyAtmInventoryAction({
        atmInventory,
        atmInventoryDiff,
      });

      try {
        const result = await action.execute();
        if (get(result, 'status') === 'failed') {
          throw new Error('atm-inventory-item#rename: rename action failed');
        } else {
          if (this.isDestroyed || this.isDestroying) {
            return;
          }
          this.toggleRename(false);
        }
      } finally {
        action.destroy();
      }
    },
  },
});
