import Component from '@ember/component';
import { computed, observer, getProperties, get } from '@ember/object';
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
import { tag, not, and, raw, isEmpty, conditional } from 'ember-awesome-macros';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';

export default Component.extend(I18n, {
  classNames: ['lambda-function-form'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentWorkflowsFunctions.lambdaFunctionForm',

  /**
   * One of: `create`, `view`
   * @virtual
   * @type {String}
   */
  mode: undefined,

  /**
   * Required when mode == "view"
   * @virtual optional
   * @type {Models.LambdaFunction}
   */
  lambdaFunction: undefined,

  /**
   * Required when mode == "create"
   * @virtual optional
   * @type {Function}
   * @param {Object} lambdaFunction function representation
   * @returns {Promise}
   */
  onSubmit: notImplementedReject,

  /**
   * @type {ComputedProperty<Object>}
   */
  fieldsViewValues: computed('lambdaFunction', function fieldsViewValues() {
    return lambdaFunctionToFormValue(this.get('lambdaFunction'));
  }),

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
    return TextField.extend({
      isVisible: reads('isInEditMode'),
    }).create({
      name: 'name',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextareaField>}
   */
  summaryField: computed(function summaryField() {
    return TextareaField.extend({
      isVisible: reads('isInEditMode'),
    }).create({
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
    return TextField.extend({
      defaultValue: conditional(
        'isInViewMode',
        viewValuePath('openfaasOptions.dockerImage'),
        raw('')
      ),
    }).create({
      component: this,
      name: 'dockerImage',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  argumentsFieldsCollectionGroup: computed(function argumentsFieldsCollectionGroup() {
    return createFunctionIOGroup(this, 'argument');
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  resultsFieldsCollectionGroup: computed(function resultsFieldsCollectionGroup() {
    return createFunctionIOGroup(this, 'result');
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  readonlyField: computed(function readonlyField() {
    return ToggleField.extend({
      defaultValue: conditional(
        'isInViewMode',
        viewValuePath('readonly'),
        raw(true)
      ),
    }).create({
      component: this,
      name: 'readonly',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  mountSpaceField: computed(function mountSpaceField() {
    return ToggleField.extend({
      defaultValue: conditional(
        'isInViewMode',
        viewValuePath('mountSpace'),
        raw(true)
      ),
    }).create({
      component: this,
      name: 'mountSpace',
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
    return TextField.extend({
      defaultValue: conditional(
        'isInViewMode',
        viewValuePath('mountSpaceOptions.mountPoint'),
        raw('/mnt/onedata')
      ),
    }).create({
      component: this,
      name: 'mountPoint',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  oneclientOptionsField: computed(function oneclientOptionsField() {
    return TextField.extend({
      defaultValue: conditional(
        'isInViewMode',
        viewValuePath('mountSpaceOptions.oneclientOptions'),
        raw('')
      ),
    }).create({
      component: this,
      name: 'oneclientOptions',
      isOptional: true,
    });
  }),

  modeObserver: observer('mode', function modeObserver() {
    const {
      mode,
      fields,
    } = this.getProperties('mode', 'fields');

    fields.changeMode(mode === 'view' ? 'view' : 'edit');
  }),

  init() {
    this._super(...arguments);

    this.modeObserver();
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

function createFunctionIOGroup(component, ioType) {
  const isForArguments = ioType === 'argument';
  const groupName = isForArguments ? 'arguments' : 'results';
  return FormFieldsCollectionGroup.extend({
    isVisible: not(and('isInViewMode', isEmpty('value.__fieldsValueNames'))),
    defaultValue: conditional(
      'isInViewMode',
      viewValuePath(groupName),
      raw(undefined)
    ),
    fieldFactoryMethod(uniqueFieldValueName) {
      const mode = this.get('mode') !== 'view' ? 'edit' : 'view';
      return FormFieldsGroup.create({
        name: 'entry',
        valueName: uniqueFieldValueName,
        fields: [
          TextField.create({
            mode,
            name: 'entryName',
            defaultValue: '',
          }),
          DropdownField.extend({
            defaultValue: reads('options.firstObject.value'),
          }).create({
            mode,
            name: 'entryType',
            options: isForArguments ? [
              { value: 'string' },
              { value: 'object' },
              { value: 'listStream' },
              { value: 'mapStream' },
              { value: 'filesTreeStream' },
              { value: 'histogram' },
            ] : [
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
            mode,
            name: 'entryArray',
            defaultValue: false,
          }),
          ToggleField.create({
            mode,
            name: 'entryOptional',
            defaultValue: false,
          }),
          ...(isForArguments ? [
            TextField.extend({
              isVisible: not(and('isInViewMode', isEmpty('value'))),
            }).create({
              mode,
              name: 'entryDefaultValue',
              defaultValue: '',
              isOptional: true,
            }),
          ] : []),
        ],
      });
    },
    dumpDefaultValue() {
      return this.get('defaultValue') || this._super(...arguments);
    },
  }).create({
    component,
    name: groupName,
  });
}

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
  const functionArguments = formIOToFunctionIO('argument', formArguments);
  const functionResults = formIOToFunctionIO('result', formResults);
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

function formIOToFunctionIO(ioType, formData) {
  return get(formData, '__fieldsValueNames').map(valueName => {
    const {
      entryName,
      entryType,
      entryArray,
      entryOptional,
      entryDefaultValue,
    } = getProperties(
      get(formData, valueName) || {},
      'entryName',
      'entryType',
      'entryArray',
      'entryOptional',
      'entryDefaultValue'
    );
    const functionData = {
      name: entryName,
      type: entryType,
      array: entryArray,
      optional: entryOptional,
    };
    if (ioType === 'argument') {
      functionData.defaultValue = entryDefaultValue;
    }
    return functionData;
  });
}

function lambdaFunctionToFormValue(lambdaFunction) {
  const {
    name,
    operationRef,
    executionOptions,
    arguments: funcArguments,
    results: funcResults,
  } = getProperties(
    lambdaFunction || {},
    'name',
    'operationRef',
    'executionOptions',
    'arguments',
    'results'
  );

  const {
    readonly,
    mountSpaceOptions,
  } = getProperties(executionOptions || {}, 'readonly', 'mountSpaceOptions');

  const {
    mountOneclient,
    mountPoint,
    oneclientOptions,
  } = getProperties(
    mountSpaceOptions || {},
    'mountOneclient',
    'mountPoint',
    'oneclientOptions'
  );

  const formArguments = functionIOToFormIO('argument', funcArguments);
  const formResults = functionIOToFormIO('result', funcResults);

  return {
    name,
    openfaasOptions: {
      dockerImage: operationRef,
    },
    readonly: Boolean(readonly),
    mountSpace: Boolean(mountOneclient),
    mountSpaceOptions: {
      mountPoint,
      oneclientOptions,
    },
    arguments: formArguments,
    results: formResults,
  };
}

function functionIOToFormIO(ioType, functionData) {
  const formData = {
    __fieldsValueNames: [],
  };
  (functionData || []).forEach((entry, idx) => {
    const {
      name,
      type,
      array,
      optional,
      defaultValue,
    } = getProperties(
      entry || {},
      'name',
      'type',
      'array',
      'optional',
      'defaultValue'
    );
    if (!name || !type) {
      return;
    }

    const valueName = `entry${idx}`;
    formData.__fieldsValueNames.push(valueName);
    formData[valueName] = {
      entryName: name,
      entryType: type,
      entryArray: Boolean(array),
      entryOptional: Boolean(optional),
      entryDefaultValue: defaultValue,
    };
    if (ioType === 'argument') {
      formData[valueName].entryDefaultValue = defaultValue;
    }
  });
  return formData;
}

function viewValuePath(fieldPath) {
  return `component.fieldsViewValues.${fieldPath}`;
}
