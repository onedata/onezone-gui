import Component from '@ember/component';
import { computed, getProperties, get } from '@ember/object';
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
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Component.extend(I18n, {
  classNames: ['lambda-function-form'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentWorkflowsFunctions.lambdaFunctionForm',

  /**
   * @type {Function}
   * @param {Object} lambdaFunction function representation
   * @returns {Promise}
   */
  onSubmit: notImplementedReject,

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const {
      nameField,
      summaryField,
      engineField,
      openfaasOptionsFieldsGroup,
      argumentsFieldsCollectionGroup,
      resultsFieldsCollectionGroup,
      readonlyField,
      mountSpaceField,
      mountSpaceOptionsFieldsGroup,
    } = this.getProperties(
      'nameField',
      'summaryField',
      'engineField',
      'openfaasOptionsFieldsGroup',
      'argumentsFieldsCollectionGroup',
      'resultsFieldsCollectionGroup',
      'readonlyField',
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
        summaryField,
        engineField,
        openfaasOptionsFieldsGroup,
        argumentsFieldsCollectionGroup,
        resultsFieldsCollectionGroup,
        readonlyField,
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
  summaryField: computed(function summaryField() {
    return TextareaField.create({
      name: 'summary',
      isOptional: true,
      defaultValue: '',
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
  readonlyField: computed(function readonlyField() {
    return ToggleField.create({
      name: 'readonly',
      defaultValue: true,
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
    } = this.getProperties('mountPointField', 'oneclientOptionsField');

    return FormFieldsGroup.extend({
      isExpanded: reads('valuesSource.mountSpace'),
    }).create({
      name: 'mountSpaceOptions',
      fields: [
        mountPointField,
        oneclientOptionsField,
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
      defaultValue: '',
    });
  }),

  init() {
    this._super(...arguments);

    this.get('fields').reset();
  },

  actions: {
    submit() {
      const {
        fields,
        onSubmit,
      } = this.getProperties('fields', 'onSubmit');

      const lambdaFunction = formValueToLambdaFunction(fields.dumpValue());
      return onSubmit(lambdaFunction);
    },
  },
});

function formValueToLambdaFunction(formValue) {
  const {
    name,
    summary,
    engine,
    openfaasOptions,
    readonly,
    mountSpace,
    mountSpaceOptions: formMountSpaceOptions,
    arguments: formArguments,
    results: formResults,
  } = getProperties(
    formValue,
    'name',
    'summary',
    'engine',
    'openfaasOptions',
    'readonly',
    'mountSpace',
    'mountSpaceOptions',
    'arguments',
    'results'
  );
  const operationRef = get(openfaasOptions, 'dockerImage');
  const mountSpaceOptions = {
    mountOneclient: mountSpace,
  };
  if (mountSpace) {
    const {
      mountPoint,
      oneclientOptions,
    } = getProperties(
      formMountSpaceOptions,
      'mountPoint',
      'oneclientOptions',
    );
    Object.assign(mountSpaceOptions, {
      mountPoint,
      oneclientOptions,
    });
  }
  const executionOptions = {
    readonly,
    mountSpaceOptions,
  };
  const functionArguments = get(formArguments, '__fieldsValueNames').map(valueName => {
    const {
      argumentName,
      argumentType,
      argumentArray,
      argumentOptional,
      argumentDefaultValue,
    } = getProperties(
      get(formArguments, valueName) || {},
      'argumentName',
      'argumentType',
      'argumentArray',
      'argumentOptional',
      'argumentDefaultValue'
    );
    return {
      name: argumentName,
      type: argumentType,
      array: argumentArray,
      optional: argumentOptional,
      defaultValue: argumentDefaultValue,
    };
  });
  const functionResults = get(formResults, '__fieldsValueNames').map(valueName => {
    const {
      resultName,
      resultType,
      resultArray,
      resultOptional,
    } = getProperties(
      get(formResults, valueName) || {},
      'resultName',
      'resultType',
      'resultArray',
      'resultOptional',
    );
    return {
      name: resultName,
      type: resultType,
      array: resultArray,
      optional: resultOptional,
    };
  });
  return {
    name,
    summary,
    description: '',
    engine,
    operationRef,
    executionOptions,
    arguments: functionArguments,
    results: functionResults,
  };
}
