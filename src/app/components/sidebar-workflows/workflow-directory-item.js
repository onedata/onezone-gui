/**
 * A first-level item component for workflow directories sidebar.
 *
 * @module components/sidebar-workflows/workflow-directory-item
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

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarWorkflows.workflowDirectoryItem',

  /**
   * @type {Models.WorkflowDirectory}
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
   * @type {ComputedProperty<Models.WorkflowDirectory>}
   */
  workflowDirectory: reads('item'),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  renameAction: computed('isRenaming', function renameAction() {
    return {
      action: () => this.send('toggleRename', true),
      title: this.t('actions.rename.title'),
      className: 'rename-workflow-directory-action-trigger',
      icon: 'rename',
      disabled: this.get('isRenaming'),
    };
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  removeAction: computed('workflowDirectory', function removeAction() {
    const {
      workflowDirectory,
      workflowActions,
    } = this.getProperties('workflowDirectory', 'workflowActions');
    return workflowActions.createRemoveWorkflowDirectoryAction({
      workflowDirectory,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Array<Action>>}
   */
  itemActions: collect('renameAction', 'removeAction'),

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
        workflowDirectory,
        workflowActions,
      } = this.getProperties('workflowDirectory', 'workflowActions');
      const workflowDirectoryDiff = { name };
      const action = workflowActions.createModifyWorkflowDirectoryAction({
        workflowDirectory,
        workflowDirectoryDiff,
      });

      return action.execute().then(result => {
        if (get(result, 'status') === 'failed') {
          return reject();
        } else {
          safeExec(this, () => this.send('toggleRename', false));
        }
      });
    },
  },
});
