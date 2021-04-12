import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import TextareaField from 'onedata-gui-common/utils/form-component/textarea-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { tag } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  classNames: ['lambda-function-form'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentWorkflowsFunctions.lambdaFunctionForm',

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const {
      nameField,
      shortDescriptionField,
      engineField,
      openfaasOptionsFieldsGroup,
      argumentsFieldsCollectionGroup,
      resultsFieldsCollectionGroup,
      mountSpaceField,
      mountSpaceOptionsFieldsGroup,
    } = this.getProperties(
      'nameField',
      'shortDescriptionField',
      'engineField',
      'openfaasOptionsFieldsGroup',
      'argumentsFieldsCollectionGroup',
      'resultsFieldsCollectionGroup',
      'mountSpaceField',
      'mountSpaceOptionsFieldsGroup'
    );

    const component = this;

    return FormFieldsRootGroup.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
    }).create({
      component,
      fields: [
        nameField,
        shortDescriptionField,
        engineField,
        openfaasOptionsFieldsGroup,
        argumentsFieldsCollectionGroup,
        resultsFieldsCollectionGroup,
        mountSpaceField,
        mountSpaceOptionsFieldsGroup,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  nameField: computed(function nameField() {
    return TextField.create({
      name: 'name',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextareaField>}
   */
  shortDescriptionField: computed(function shortDescriptionField() {
    return TextareaField.create({
      name: 'shortDescription',
      isOptional: true,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  engineField: computed(function engineField() {
    return DropdownField.create({
      name: 'engine',
      options: [
        { value: 'openfaas' },
      ],
      defaultValue: 'openfaas',
      showSearch: false,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  openfaasOptionsFieldsGroup: computed(function openfaasOptionsFieldsGroup() {
    const dockerImageField = this.get('dockerImageField');
    return FormFieldsGroup.create({
      name: 'openfaasOptions',
      fields: [
        dockerImageField,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  dockerImageField: computed(function dockerImageField() {
    return TextField.create({
      name: 'dockerImage',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  argumentsFieldsCollectionGroup: computed(function () {
    return FormFieldsCollectionGroup.create({
      name: 'arguments',
      fieldFactoryMethod(uniqueFieldValueName) {
        return FormFieldsGroup.create({
          name: 'argument',
          valueName: uniqueFieldValueName,
          fields: [
            TextField.create({
              name: 'argumentName',
              defaultValue: '',
            }),
            DropdownField.extend({
              defaultValue: reads('options.firstObject.value'),
            }).create({
              name: 'argumentType',
              options: [
                { value: 'string' },
                { value: 'object' },
                { value: 'listStream' },
                { value: 'mapStream' },
                { value: 'filesTreeStream' },
                { value: 'histogram' },
              ],
            }),
            ToggleField.create({
              name: 'argumentArray',
              defaultValue: false,
            }),
            ToggleField.create({
              name: 'argumentOptional',
              defaultValue: false,
            }),
            TextField.create({
              name: 'argumentDefaultValue',
              defaultValue: '',
              isOptional: true,
            }),
          ],
        });
      },
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  resultsFieldsCollectionGroup: computed(function () {
    return FormFieldsCollectionGroup.create({
      name: 'results',
      fieldFactoryMethod(uniqueFieldValueName) {
        return FormFieldsGroup.create({
          name: 'result',
          valueName: uniqueFieldValueName,
          fields: [
            TextField.create({
              name: 'resultName',
              defaultValue: '',
            }),
            DropdownField.extend({
              defaultValue: reads('options.firstObject.value'),
            }).create({
              name: 'resultType',
              options: [
                { value: 'string' },
                { value: 'object' },
                { value: 'listStreamOperation' },
                { value: 'mapStreamOperation' },
                { value: 'filesTreeStreamOperation' },
                { value: 'dataReadStats' },
                { value: 'dataWriteStats' },
                { value: 'networkTransferStats' },
                { value: 'auditLogRecord' },
              ],
            }),
            ToggleField.create({
              name: 'resultArray',
              defaultValue: false,
            }),
            ToggleField.create({
              name: 'resultOptional',
              defaultValue: false,
            }),
          ],
        });
      },
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  mountSpaceField: computed(function mountSpaceField() {
    return ToggleField.create({
      name: 'mountSpace',
      defaultValue: true,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  mountSpaceOptionsFieldsGroup: computed(function mountSpaceOptionsFieldsGroup() {
    const {
      mountPointField,
      oneclientOptionsField,
      readOnlyField,
    } = this.getProperties('mountPointField', 'oneclientOptionsField', 'readOnlyField');

    return FormFieldsGroup.extend({
      isExpanded: reads('valuesSource.mountSpace'),
    }).create({
      name: 'mountSpaceOptions',
      fields: [
        mountPointField,
        oneclientOptionsField,
        readOnlyField,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  mountPointField: computed(function mountPointField() {
    return TextField.create({
      name: 'mountPoint',
      defaultValue: '/mnt/onedata',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  oneclientOptionsField: computed(function oneclientOptionsField() {
    return TextField.create({
      name: 'oneclientOptions',
      isOptional: true,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  readOnlyField: computed(function readOnlyField() {
    return ToggleField.create({
      name: 'readOnly',
      defaultValue: true,
    });
  }),

  init() {
    this._super(...arguments);

    this.get('fields').reset();
  },
});
