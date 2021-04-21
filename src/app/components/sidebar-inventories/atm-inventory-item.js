/**
 * A first-level item component for automation inventories sidebar.
 *
 * @module components/sidebar-inventories/atm-inventory-item
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  workflowActions: service(),
  navigationState: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarInventories.atmInventoryItem',

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
   * @type {Boolean}
   */
  isLeaveModalOpened: false,

  /**
   * @type {Boolean}
   */
  isLeaving: false,

  /**
   * Alias for `item` to make code more verbose
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('item'),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    return {
      action: () => this.send('toggleRename', true),
      title: this.t('actions.rename.title'),
      className: 'rename-atm-inventory-action-trigger',
      icon: 'rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  leaveAction: computed(function leaveAction() {
    return {
      action: () => this.send('showLeaveModal'),
      title: this.t('actions.leave.title'),
      class: 'leave-atm-inventory-action-trigger',
      icon: 'group-leave-group',
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed('atmInventory', function removeAction() {
    const {
      atmInventory,
      workflowActions,
    } = this.getProperties('atmInventory', 'workflowActions');
    return workflowActions.createRemoveAtmInventoryAction({
      atmInventory,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  itemActions: collect('renameAction', 'leaveAction', 'removeAction'),

  actions: {
    toggleRename(value) {
      this.set('isRenaming', value);
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
      const atmInventoryDiff = { name };
      const action = workflowActions.createModifyAtmInventoryAction({
        atmInventory,
        atmInventoryDiff,
      });

      return action.execute().then(result => {
        if (get(result, 'status') === 'failed') {
          return reject();
        } else {
          safeExec(this, () => this.send('toggleRename', false));
        }
      });
    },
    showLeaveModal() {
      this.set('isLeaveModalOpened', true);
    },
    closeLeaveModal() {
      this.set('isLeaveModalOpened', false);
    },
    leave() {
      const {
        atmInventory,
        workflowActions,
        navigationState,
      } = this.getProperties(
        'atmInventory',
        'workflowActions',
        'navigationState'
      );
      this.set('isLeaving', true);
      return workflowActions.leaveAtmInventory(atmInventory)
        .then(() => navigationState.redirectToCollectionIfResourceNotExist())
        .finally(() =>
          safeExec(this, 'setProperties', {
            isLeaving: false,
            isLeaveModalOpened: false,
          })
        );
    },
  },
});
