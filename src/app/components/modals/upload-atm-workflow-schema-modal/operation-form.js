import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import { computed, get, getProperties } from '@ember/object';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import { tag, eq, raw, not, and, bool, getBy } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  tagName: 'form',
  classNames: ['operation-form', 'form-component', 'form-horizontal'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.uploadAtmWorkflowSchemaModal.operationForm',

  /**
   * @virtual
   * @type {Object}
   */
  dump: undefined,

  /**
   * @virtual
   * @type {'merge'|'create'}
   */
  selectedOperation: undefined,

  /**
   * @virtual
   * @type {Array<Models.AtmWorkflowSchema>}
   */
  targetWorkflows: undefined,

  /**
   * @virtual
   * @type {Models.AtmWorkflowSchema}
   */
  selectedTargetWorkflow: undefined,

  /**
   * @virtual
   * @type {String}
   */
  newWorkflowName: undefined,

  /**
   * @type {(fieldName: string, value: any) => void}
   */
  onValueChange: undefined,

  /**
   * @type {ComputedProperty<Number>}
   */
  revisionNumber: reads('dump.initialRevision.originalRevisionNumber'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isMergeDisabled: not('targetWorkflows.length'),

  /**
   * @type {ComputedProperty<Boolean>}
   */
  isRevisionConflictWarningVisible: and(
    eq('selectedOperation', raw('merge')),
    bool(getBy('selectedTargetWorkflow.revisionRegistry', 'revisionNumber'))
  ),

  /**
   * @type {ComputedProperty<Array<Object>>}
   */
  operationsRadioOptions: computed('isMergeDisabled', function operationsRadioOptions() {
    return [{
      name: 'merge',
      value: 'merge',
      label: this.t('operations.merge.label'),
      disabled: this.get('isMergeDisabled'),
    }, {
      name: 'create',
      value: 'create',
      label: this.t('operations.create.label'),
    }];
  }),

  /**
   * @type {ComputedProperty<Object>}
   */
  formValues: computed(
    'selectedTargetWorkflow',
    'newWorkflowName',
    function formValues() {
      const {
        selectedTargetWorkflow,
        newWorkflowName,
      } = this.getProperties('selectedTargetWorkflow', 'newWorkflowName');

      return {
        targetWorkflow: selectedTargetWorkflow,
        newWorkflowName,
      };
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const {
      targetWorkflowField,
      newWorkflowsNameField,
    } = this.getProperties('targetWorkflowField', 'newWorkflowsNameField');

    const component = this;
    return FormFieldsRootGroup
      .extend({
        i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
        valuesSource: reads('component.formValues'),
        onValueChange(value, field) {
          field.markAsModified();
          const {
            notifyChangeName,
            name,
          } = getProperties(field, 'notifyChangeName', 'name');
          component.notifyAboutChange(notifyChangeName || name, value);
        },
      })
      .create({
        component,
        ownerSource: this,
        fields: [
          targetWorkflowField,
          newWorkflowsNameField,
        ],
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  targetWorkflowField: computed(function targetWorkflowField() {
    return DropdownField.extend({
      options: computed('component.targetWorkflows', function options() {
        const workflows = this.get('component.targetWorkflows') || [];
        return workflows.sortBy('name').map(workflow => ({
          label: get(workflow, 'name'),
          value: workflow,
        }));
      }),
      isEnabled: eq('component.selectedOperation', raw('merge')),
    }).create({
      component: this,
      name: 'targetWorkflow',
      notifyChangeName: 'selectedTargetWorkflow',
      classes: 'form-group-sm',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  newWorkflowsNameField: computed(function newWorkflowsNameField() {
    return TextField.extend({
      isEnabled: eq('component.selectedOperation', raw('create')),
    }).create({
      component: this,
      name: 'newWorkflowName',
      classes: 'form-group-sm',
    });
  }),

  init() {
    this._super(...arguments);
    this.get('fields');
  },

  /**
   * @override
   */
  submit(event) {
    this._super(...arguments);
    event.preventDefault();
  },

  notifyAboutChange(fieldName, newValue) {
    const onValueChange = this.get('onValueChange');
    if (onValueChange) {
      onValueChange(fieldName, newValue);
    }
  },

  actions: {
    selectedOperationChange(newOperation) {
      this.notifyAboutChange('selectedOperation', newOperation);
    },
  },
});
