/**
 * Shows single workflow schema details.
 *
 * @module components/content-atm-inventories-workflows/atm-workflow-schemas-list-entry
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get, trySet } from '@ember/object';
import { collect } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  classNames: ['atm-workflow-schemas-list-entry', 'iconified-block'],
  classNameBindings: ['isEditing:is-editing:hoverable'],

  i18n: service(),
  workflowActions: service(),
  clipboardActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesWorkflows.atmWorkflowSchemasListEntry',

  /**
   * @virtual
   * @type {Models.AtmWorkflowSchema}
   */
  atmWorkflowSchema: undefined,

  /**
   * @virtual
   * @type {Function}
   * @returns {any}
   */
  onAtmWorkflowSchemaClick: notImplementedIgnore,

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * New data, that should be applied to the model on "Save" click. Yielded
   * by the form.
   * @type {Object}
   */
  changesToApply: undefined,

  /**
   * If true, then `changesToApply` contains valid data.
   * @type {Boolean}
   */
  areChangesValid: true,

  /**
   * @type {Boolean}
   */
  isSavingChanges: false,

  /**
   * @type {Boolean}
   */
  isEditing: false,

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  changeDetailsAction: computed('isEditing', function changeDetailsAction() {
    return {
      action: () => this.set('isEditing', true),
      title: this.t('changeDetailsAction'),
      class: 'change-details-action-trigger',
      icon: 'rename',
      disabled: this.get('isEditing'),
    };
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  dumpAction: computed('atmWorkflowSchema', function dumpAction() {
    const {
      workflowActions,
      atmWorkflowSchema,
    } = this.getProperties('workflowActions', 'atmWorkflowSchema');
    return workflowActions.createDumpAtmWorkflowSchemaAction({
      atmWorkflowSchema,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.Action>}
   */
  removeAction: computed('atmWorkflowSchema', function removeAction() {
    const {
      workflowActions,
      atmWorkflowSchema,
    } = this.getProperties('workflowActions', 'atmWorkflowSchema');
    return workflowActions.createRemoveAtmWorkflowSchemaAction({
      atmWorkflowSchema,
    });
  }),

  /**
   * @type {Ember.ComputedProperty<Action>}
   */
  copyIdAction: computed('atmWorkflowSchema', function copyIdAction() {
    const {
      atmWorkflowSchema,
      clipboardActions,
    } = this.getProperties('atmWorkflowSchema', 'clipboardActions');

    return clipboardActions.createCopyRecordIdAction({ record: atmWorkflowSchema });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  workflowActionsArray: collect(
    'changeDetailsAction',
    'dumpAction',
    'removeAction',
    'copyIdAction'
  ),

  click(event) {
    const {
      isEditing,
      onAtmWorkflowSchemaClick,
      element,
    } = this.getProperties('isEditing', 'onAtmWorkflowSchemaClick', 'element');
    const clickableElements = [...element.querySelectorAll('.clickable')];

    if (
      isEditing ||
      clickableElements.includes(event.target) ||
      clickableElements.some(clkElement => clkElement.contains(event.target)) ||
      !element.contains(event.target)
    ) {
      // Should be handled by another clickable element.
      return;
    }
    onAtmWorkflowSchemaClick();
  },

  actions: {
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
    detailsChanged({ data, isValid }) {
      this.setProperties({
        changesToApply: isValid ? data : undefined,
        areChangesValid: isValid,
      });
    },
    saveChanges() {
      this.set('isSavingChanges', true);
      const {
        changesToApply,
        atmWorkflowSchema,
        workflowActions,
      } = this.getProperties('changesToApply', 'atmWorkflowSchema', 'workflowActions');

      return workflowActions.createModifyAtmWorkflowSchemaAction({
        atmWorkflowSchema,
        atmWorkflowSchemaDiff: changesToApply,
      }).execute().then(result => {
        if (get(result, 'status') === 'done') {
          trySet(this, 'isEditing', false);
        }
        trySet(this, 'isSavingChanges', false);
      });
    },
    cancelChanges() {
      this.set('isEditing', false);
    },
  },
});
