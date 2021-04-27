import Component from '@ember/component';
import { computed, observer, get, getProperties, trySet } from '@ember/object';
import { reads, collect } from '@ember/object/computed';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import { tag, or } from 'ember-awesome-macros';
import { scheduleOnce } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['workflows-list-entry'],

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
   * @type {Boolean}
   */
  areActionsOpened: false,

  /**
   * @type {Boolean}
   */
  isEditing: false,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    return FormFieldsRootGroup
      .extend({
        i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      })
      .create({
        component: this,
        ownerSource: this,
        fields: [
          TextField.extend({
            defaultValue: reads('component.workflow.name'),
          }).create({
            component: this,
            name: 'name',
          }),
          TextareaField.extend({
            defaultValue: reads('component.workflow.description'),
            isVisible: or('isInEditMode', 'value'),
          }).create({
            component: this,
            name: 'description',
            viewModeAsStaticText: true,
            isOptional: true,
          }),
        ],
      });
  }),

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
   * @type {ComputedProperty<Array<Utils.Action>>}
   */
  workflowActionsArray: collect('changeDetailsAction'),

  fieldsUpdateTrigger: observer(
    'workflow.{name,description}',
    function fieldsUpdateTrigger() {
      const fields = this.get('fields');

      if (get(fields, 'isInViewMode')) {
        fields.reset();
      }
    }
  ),

  isEditingObserver: observer('isEditing', function isEditingObserver() {
    const {
      fields,
      isEditing,
    } = this.getProperties('fields', 'isEditing');

    fields.changeMode(isEditing ? 'edit' : 'view');
  }),

  init() {
    this._super(...arguments);

    this.get('fields').changeMode('view');
    this.fieldsUpdateTrigger();
    this.isEditingObserver();
  },

  actions: {
    toggleActionsOpen(state) {
      scheduleOnce('afterRender', this, 'set', 'areActionsOpened', state);
    },
    saveChanges() {
      const {
        fields,
        workflow,
        workflowActions,
      } = this.getProperties('fields', 'workflow', 'workflowActions');

      const formValues = fields.dumpValue();

      return workflowActions.createModifyAtmWorkflowSchemaAction({
        atmWorkflowSchema: workflow,
        atmWorkflowSchemaDiff: getProperties(formValues, 'name', 'description'),
      }).execute().then(result => {
        if (get(result, 'status') === 'done') {
          trySet(this, 'isEditing', false);
        }
      });
    },
    cancelChanges() {
      this.get('fields').reset();
      this.set('isEditing', false);
    },
  },
});
