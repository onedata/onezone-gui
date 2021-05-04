import Component from '@ember/component';
import { computed, get, trySet } from '@ember/object';
import { collect } from '@ember/object/computed';
import { scheduleOnce } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  classNames: ['workflows-list-entry', 'iconified-block'],
  classNameBindings: ['isEditing:is-editing:hoverable'],

  i18n: service(),
  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentInventoriesWorkflows.workflowsListEntry',

  /**
   * @virtual
   * @type {Models.AtmWorkflowSchema}
   */
  workflow: undefined,

  /**
   * @virtual
   * @type {Function}
   * @returns {any}
   */
  onWorkflowClick: notImplementedIgnore,

  /**
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * New data, that should be applied to the model on "Save" click. Yielded
   * by the form
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
  removeAction: computed('workflow', function removeAction() {
    return this.get('workflowActions').createRemoveAtmWorkflowSchemaAction({
      atmWorkflowSchema: this.get('workflow'),
    });
  }),

  /**
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  workflowActionsArray: collect('changeDetailsAction', 'removeAction'),

  click(event) {
    const {
      isEditing,
      onWorkflowClick,
    } = this.getProperties('isEditing', 'onWorkflowClick');
    const clickableElements = [...this.$('.clickable')];

    if (
      isEditing ||
      clickableElements.includes(event.target) ||
      clickableElements.some(element => element.contains(event.target))
    ) {
      // Should be handled by nested clickable element.
      return;
    }
    onWorkflowClick();
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
        workflow,
        workflowActions,
      } = this.getProperties('changesToApply', 'workflow', 'workflowActions');

      return workflowActions.createModifyAtmWorkflowSchemaAction({
        atmWorkflowSchema: workflow,
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
