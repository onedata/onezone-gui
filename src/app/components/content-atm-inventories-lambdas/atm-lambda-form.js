/**
 * Allows to create new and show existing lambda records.
 * NOTE: it does not persist data. To save created lambda, you need
 * to do it on your own by providing `onSubmit` (which should return a promise).
 *
 * @module components/content-atm-inventories-lambdas/atm-lambda-form
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer, get, trySet, defineProperty } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import JsonField from 'onedata-gui-common/utils/form-component/json-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import { tag, eq, neq, or, not, and, raw, isEmpty, conditional, getBy, array } from 'ember-awesome-macros';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import {
  formDataToRecord,
  recordToFormData,
} from 'onezone-gui/utils/content-atm-inventories-lambdas/atm-lambda-form';
import _ from 'lodash';
import { validator } from 'ember-cp-validations';
import { createTaskResourcesFields } from 'onedata-gui-common/utils/workflow-visualiser/task-resources-fields';

// TODO: VFS-7655 Add tooltips and placeholders

export default Component.extend(I18n, {
  classNames: ['atm-lambda-form'],
  classNameBindings: ['modeClass'],

  i18n: service(),
  media: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesLambdas.atmLambdaForm',

  /**
   * One of: `'create'`, `'view'`, `'edit'`
   * @virtual
   * @type {String}
   */
  mode: undefined,

  /**
   * Record to visualise in `view` mode (so in that mode it is a required field).
   * @virtual optional
   * @type {Models.AtmLambda}
   */
  atmLambda: undefined,

  /**
   * @virtual optional
   * @type {AtmResourceSpec}
   */
  defaultAtmResourceSpec: undefined,

  /**
   * Required when `mode` is `create` or `edit`
   * @virtual optional
   * @type {Function}
   * @param {Object} rawAtmLambda lambda representation
   * @returns {Promise}
   */
  onSubmit: notImplementedReject,

  /**
   * Required when `mode` is `edit`
   * @virtual optional
   * @type {Function}
   * @returns {any}
   */
  onCancel: notImplementedIgnore,

  /**
   * @type {String}
   */
  btnSize: undefined,

  /**
   * @type {Boolean}
   */
  isSubmitting: false,

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Object>}
   */
  fieldsValuesFromRecord: computed(
    'atmLambda.{name,summary,description,operationSpec,argumentSpecs,resultSpecs}',
    'defaultAtmResourceSpec',
    function fieldsValuesFromRecord() {
      const {
        defaultAtmResourceSpec,
        atmLambda,
      } = this.getProperties('defaultAtmResourceSpec', 'atmLambda');
      return recordToFormData(atmLambda, defaultAtmResourceSpec);
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    const {
      nameField,
      summaryField,
      engineField,
      openfaasOptionsFieldsGroup,
      onedataFunctionOptionsFieldsGroup,
      argumentsFieldsCollectionGroup,
      resultsFieldsCollectionGroup,
      resourcesFieldsGroup,
    } = this.getProperties(
      'nameField',
      'summaryField',
      'engineField',
      'openfaasOptionsFieldsGroup',
      'onedataFunctionOptionsFieldsGroup',
      'argumentsFieldsCollectionGroup',
      'resultsFieldsCollectionGroup',
      'resourcesFieldsGroup'
    );

    const component = this;

    return FormFieldsRootGroup.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
      isEnabled: not('component.isSubmitting'),
    }).create({
      component,
      fields: [
        nameField,
        summaryField,
        engineField,
        openfaasOptionsFieldsGroup,
        onedataFunctionOptionsFieldsGroup,
        argumentsFieldsCollectionGroup,
        resultsFieldsCollectionGroup,
        resourcesFieldsGroup,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  nameField: computed(function nameField() {
    return TextField.extend(defaultValueGenerator(this), {
      isVisible: reads('isInEditMode'),
    }).create({
      name: 'name',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  summaryField: computed(function summaryField() {
    return TextField.extend(defaultValueGenerator(this), {
      isVisible: reads('isInEditMode'),
    }).create({
      name: 'summary',
      isOptional: true,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  engineField: computed(function engineField() {
    const viewOptions = [
      { value: 'openfaas' },
      { value: 'onedataFunction' },
    ];
    const editOptions = viewOptions.rejectBy('value', 'onedataFunction');

    return DropdownField.extend(
      defaultValueGenerator(this),
      disableFieldInEditMode(this), {
        options: conditional('isInViewMode', raw(viewOptions), raw(editOptions)),
      }).create({
      name: 'engine',
      showSearch: false,
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  openfaasOptionsFieldsGroup: computed(function openfaasOptionsFieldsGroup() {
    const mountSpaceOptionsFieldsGroup = this.get('mountSpaceOptionsFieldsGroup');
    return FormFieldsGroup.extend(disableFieldInEditMode(this), {
      isVisible: eq('valuesSource.engine', raw('openfaas')),
    }).create({
      name: 'openfaasOptions',
      fields: [
        TextField.extend(defaultValueGenerator(this)).create({
          name: 'dockerImage',
        }),
        ToggleField.extend(defaultValueGenerator(this)).create({
          name: 'readonly',
        }),
        ToggleField.extend(defaultValueGenerator(this)).create({
          name: 'mountSpace',
        }),
        mountSpaceOptionsFieldsGroup,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  mountSpaceOptionsFieldsGroup: computed(function mountSpaceOptionsFieldsGroup() {
    return FormFieldsGroup.extend({
      isVisible: or('isInEditMode', 'valuesSource.openfaasOptions.mountSpace'),
      isExpanded: or('isInViewMode', 'valuesSource.openfaasOptions.mountSpace'),
    }).create({
      name: 'mountSpaceOptions',
      fields: [
        TextField.extend(defaultValueGenerator(this)).create({
          name: 'mountPoint',
        }),
        TextField.extend(defaultValueGenerator(this), {
          isVisible: not(and('isInViewMode', isEmpty('value'))),
        }).create({
          name: 'oneclientOptions',
          isOptional: true,
        }),
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  onedataFunctionOptionsFieldsGroup: computed(
    function onedataFunctionOptionsFieldsGroup() {
      return FormFieldsGroup.extend(disableFieldInEditMode(this), {
        isVisible: eq('valuesSource.engine', raw('onedataFunction')),
      }).create({
        name: 'onedataFunctionOptions',
        fields: [
          TextField.extend(defaultValueGenerator(this)).create({
            name: 'onedataFunctionName',
          }),
        ],
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  argumentsFieldsCollectionGroup: computed(function argumentsFieldsCollectionGroup() {
    return createFunctionArgResGroup(this, 'argument');
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  resultsFieldsCollectionGroup: computed(function resultsFieldsCollectionGroup() {
    return createFunctionArgResGroup(this, 'result');
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  resourcesFieldsGroup: computed(function resourcesFieldsGroup() {
    const name = 'resources';
    return FormFieldsGroup.extend(disableFieldInEditMode(this)).create({
      name,
      addColonToLabel: false,
      classes: 'task-resources-fields',
      fields: createTaskResourcesFields({
        pathToGroup: name,
        cpuRequestedDefaultValueMixin: defaultValueGenerator(this),
        cpuLimitDefaultValueMixin: defaultValueGenerator(this),
        memoryRequestedDefaultValueMixin: defaultValueGenerator(this),
        memoryLimitDefaultValueMixin: defaultValueGenerator(this),
        ephemeralStorageRequestedDefaultValueMixin: defaultValueGenerator(this),
        ephemeralStorageLimitDefaultValueMixin: defaultValueGenerator(this),
      }),
    });
  }),

  modeObserver: observer('mode', function modeObserver() {
    const {
      mode,
      fields,
    } = this.getProperties('mode', 'fields');

    fields.changeMode(mode === 'view' ? 'view' : 'edit');
    fields.reset();
  }),

  init() {
    this._super(...arguments);

    this.modeObserver();
  },

  actions: {
    cancel() {
      this.get('onCancel')();
    },
    submit() {
      const {
        mode,
        atmLambda,
        fields,
        onSubmit,
      } = this.getProperties('mode', 'atmLambda', 'fields', 'onSubmit');
      this.set('isSubmitting', true);

      const rawAtmLambdaFromForm = formDataToRecord(fields.dumpValue());
      const objectToSubmit = {};

      if (mode === 'create') {
        Object.assign(objectToSubmit, rawAtmLambdaFromForm);
      } else if (mode === 'edit' && atmLambda) {
        ['name', 'summary'].forEach(propName => {
          const origPropVal = get(atmLambda, propName);
          const newPropVal = get(rawAtmLambdaFromForm, propName);
          if (!_.isEqual(origPropVal, newPropVal)) {
            objectToSubmit[propName] = newPropVal;
          }
        });
      }

      return onSubmit(objectToSubmit)
        .then(() => fields.reset())
        .finally(() => {
          trySet(this, 'isSubmitting', false);
        });
    },
  },
});

/**
 * Generates mixin-like object, that specifies default value for field.
 * It's result should be passed to *Field.extend.
 * @param {Components.ContentAtmInventoriesLambdas.AtmLambdaForm} component
 * @returns {Object}
 */
function defaultValueGenerator(component) {
  return {
    defaultValueSource: component,
    defaultValue: getBy(
      'defaultValueSource',
      tag `fieldsValuesFromRecord.${'path'}`
    ),
  };
}

/**
 * Generates mixin-like object, that blocks field when component is in `edit` mode.
 * @param {Components.ContentAtmInventoriesLambdas.AtmLambdaForm} component
 * @returns {Object}
 */
function disableFieldInEditMode(component) {
  return {
    isEnabled: neq('modeSource.mode', raw('edit')),
    modeSource: component,
  };
}

/**
 * Generates a form collection group for arguments and results (as they are very
 * similar).
 * @param {Components.ContentAtmInventoriesLambdas.AtmLambdaForm} component
 * @param {String} dataType one of: `argument`, `result`
 * @returns {Utils.FormComponent.FormFieldsCollectionGroup}
 */
function createFunctionArgResGroup(component, dataType) {
  const isForArguments = dataType === 'argument';
  const generateEntryNameField = mode => TextField.create({
    mode,
    name: 'entryName',
    defaultValue: '',
    customValidators: [
      validator(function (value, options, model) {
        if (!value) {
          return true;
        }

        const field = get(model, 'field');
        const errorMsg =
          String(field.t(`${get(field, 'path')}.errors.notUnique`));
        const usedEntryNames = get(model, 'field.parent.parent.usedEntryNames');
        return usedEntryNames
          .filter(name => name.trim() === value.trim())
          .length <= 1 ? true : errorMsg;
      }, {
        dependentKeys: ['model.field.parent.parent.usedEntryNames'],
      }),
    ],
  });
  const generateEntryTypeField = mode => DropdownField.extend({
    defaultValue: reads('options.firstObject.value'),
  }).create({
    mode,
    name: 'entryType',
    options: [
      { value: 'integer' },
      { value: 'string' },
      { value: 'object' },
      { value: 'anyFile' },
      { value: 'regularFile' },
      { value: 'directory' },
      { value: 'symlink' },
      { value: 'dataset' },
      { value: 'onedatafsCredentials' },
      // TODO: VFS-7816 uncomment or remove future code
      // { value: 'histogram' },
      // { value: 'archive' },
      // { value: 'singleValueStore' },
      // { value: 'listStore' },
      // { value: 'mapStore' },
      // { value: 'treeForestStore' },
      // { value: 'rangeStore' },
      // { value: 'histogramStore' },
    ],
  });
  const generateEntryBatchField = mode => ToggleField.extend({
    addColonToLabel: or('component.media.isMobile', 'component.media.isTablet'),
  }).create({
    mode,
    name: 'entryBatch',
    defaultValue: false,
    component,
  });
  const generateEntryOptionalField = mode => ToggleField.extend({
    addColonToLabel: or('component.media.isMobile', 'component.media.isTablet'),
  }).create({
    mode,
    name: 'entryOptional',
    defaultValue: false,
    component,
  });
  const generateEntryDefaultValueField = mode => JsonField.extend({
    isVisible: not(or(
      and('isInViewMode', isEmpty('value')),
      array.includes(raw([
        // TODO: VFS-7816 uncomment or remove future code
        // 'singleValueStore',
        // 'listStore',
        // 'mapStore',
        // 'treeForestStore',
        // 'histogramStore',
        'onedatafsCredentials',
      ]), 'parent.value.entryType')
    )),
  }).create({
    mode,
    name: 'entryDefaultValue',
    defaultValue: '',
    isOptional: true,
  });

  const fieldsCollectionExtension = {
    isVisible: not(and('isInViewMode', isEmpty('value.__fieldsValueNames'))),
    usedEntryNames: undefined,
    valueStructureObserver: observer(
      'value.__fieldsValueNames',
      function valueStructureObserver() {
        const namePropsPaths = (this.get('value.__fieldsValueNames') || [])
          .map(entryValueName => `value.${entryValueName}.entryName`);
        // Using `set` causes some weird ember errors. Using `defineProperty`
        // as mentioned here `https://github.com/emberjs/ember.js/issues/16504#issuecomment-380793961`
        defineProperty(
          this,
          'usedEntryNames',
          computed(...namePropsPaths, function usedEntryNames() {
            const value = this.get('value') || {};
            const entryValueNames = get(value, '__fieldsValueNames') || [];
            return entryValueNames
              .map(entryValueName => get(value, `${entryValueName}.entryName`))
              .compact();
          })
        );
      }
    ),
    init() {
      this._super(...arguments);
      this.valueStructureObserver();
    },
    fieldFactoryMethod(uniqueFieldValueName) {
      const mode = this.get('mode') !== 'view' ? 'edit' : 'view';
      return FormFieldsGroup.create({
        name: 'entry',
        valueName: uniqueFieldValueName,
        fields: [
          generateEntryNameField(mode),
          generateEntryTypeField(mode),
          generateEntryBatchField(mode),
          ...(isForArguments ? [
            generateEntryOptionalField(mode),
            generateEntryDefaultValueField(mode),
          ] : []),
        ],
      });
    },
    dumpDefaultValue() {
      return this.get('defaultValue') || this._super(...arguments);
    },
  };
  return FormFieldsCollectionGroup.extend(
    defaultValueGenerator(component),
    disableFieldInEditMode(component),
    fieldsCollectionExtension
  ).create({
    name: isForArguments ? 'arguments' : 'results',
  });
}
