/**
 * A first-level item component for automation inventories sidebar.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { reject, resolve } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

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
    this.set('isRenaming', value);
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
    rename(name) {
      if (!name || !name.length) {
        return reject();
      }

      const {
        atmInventory,
        workflowActions,
      } = this.getProperties('atmInventory', 'workflowActions');

      const oldName = get(atmInventory, 'name');
      if (oldName === name) {
        this.toggleRename(false);
        return resolve();
      }

      const atmInventoryDiff = { name };
      const action = workflowActions.createModifyAtmInventoryAction({
        atmInventory,
        atmInventoryDiff,
      });

      return action.execute().then(result => {
        if (get(result, 'status') === 'failed') {
          return reject();
        } else {
          safeExec(this, () => this.toggleRename(false));
        }
      }).finally(() => action.destroy());
    },
  },
});
