/**
 * Allows to create new and show existing lambda records.
 * NOTE: it does not persist data. To save created lambda, you need
 * to do it on your own by providing `onSubmit` (which should return a promise).
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import {
  computed,
  observer,
  get,
  set,
  trySet,
  defineProperty,
} from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import FormFieldsGroup from 'onedata-gui-common/utils/form-component/form-fields-group';
import FormFieldsCollectionGroup from 'onedata-gui-common/utils/form-component/form-fields-collection-group';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import NumberField from 'onedata-gui-common/utils/form-component/number-field';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import ToggleField from 'onedata-gui-common/utils/form-component/toggle-field';
import {
  tag,
  eq,
  neq,
  or,
  not,
  and,
  raw,
  isEmpty,
  conditional,
} from 'ember-awesome-macros';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import {
  formDataToRecord,
  recordToFormData,
} from 'onezone-gui/utils/content-atm-inventories-lambdas/atm-lambda-form';
import { validator } from 'ember-cp-validations';
import { createTaskResourcesFields } from 'onedata-gui-common/utils/workflow-visualiser/task-resources-fields';
import { FormElement as DataSpecEditor } from 'onedata-gui-common/utils/atm-workflow/data-spec-editor';
import { AtmParameterSpecsEditor } from 'onedata-gui-common/utils/atm-workflow/atm-lambda';

// TODO: VFS-7655 Add tooltips and placeholders

const reservedResultNames = ['exception'];

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
   * Contains values, which should be used as default values of form fields.
   * @virtual optional
   * @type {Models.AtmLambda}
   */
  revision: undefined,

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
   * @type {Boolean}
   */
  isSubmitting: false,

  /**
   * @type {Array<String>}
   */
  reservedResultNames,

  /**
   * @type {ComputedProperty<String>}
   */
  modeClass: tag `mode-${'mode'}`,

  /**
   * @type {ComputedProperty<Object>}
   */
  fieldsValuesFromRecord: computed(
    'revision.{name,state,summary,description,operationSpec,argumentSpecs,resultSpecs}',
    'defaultAtmResourceSpec',
    'mode',
    function fieldsValuesFromRecord() {
      const {
        defaultAtmResourceSpec,
        revision,
        mode,
      } = this.getProperties('defaultAtmResourceSpec', 'revision', 'mode');
      return recordToFormData(revision, defaultAtmResourceSpec, mode);
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsRootGroup>}
   */
  fields: computed(function fields() {
    return FormFieldsRootGroup.extend({
      name: 'atm-lambda-root',
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      ownerSource: reads('component'),
      isEnabled: not(or('component.isSubmitting', eq('component.mode', raw('view')))),
    }).create({
      component: this,
      fields: [
        this.nameField,
        this.stateField,
        this.summaryField,
        this.engineField,
        this.openfaasOptionsFieldsGroup,
        this.onedataFunctionOptionsFieldsGroup,
        this.preferredBatchSizeField,
        this.configParametersField,
        this.argumentsFieldsCollectionGroup,
        this.resultsFieldsCollectionGroup,
        this.resourcesFieldsGroup,
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  nameField: computed(function nameField() {
    return TextField.extend(disableFieldInEditMode(this)).create({
      name: 'name',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  stateField: computed(function stateField() {
    return DropdownField.create({
      name: 'state',
      showSearch: false,
      options: [{ value: 'draft' }, { value: 'stable' }, { value: 'deprecated' }],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.TextField>}
   */
  summaryField: computed(function summaryField() {
    return TextField.extend(disableFieldInEditMode(this)).create({
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
        TextField.create({
          name: 'dockerImage',
        }),
        ToggleField.create({
          name: 'readonly',
        }),
        ToggleField.create({
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
        TextField.create({
          name: 'mountPoint',
        }),
        TextField.extend({
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
          TextField.create({
            name: 'onedataFunctionName',
          }),
        ],
      });
    }
  ),

  /**
   * @type {ComputedProperty<Utils.FormComponent.NumberField>}
   */
  preferredBatchSizeField: computed(function preferredBatchSizeField() {
    return NumberField.extend(disableFieldInEditMode(this)).create({
      gte: 1,
      integer: true,
      name: 'preferredBatchSize',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  argumentsFieldsCollectionGroup: computed(function argumentsFieldsCollectionGroup() {
    return AtmParameterSpecsEditor
      .extend(disableFieldInEditMode(this))
      .create({
        name: 'arguments',
        label: this.t('fields.arguments.label'),
        addButtonText: this.t('fields.arguments.addButtonText'),
        classes: 'input-output-data-collection',
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsCollectionGroup>}
   */
  resultsFieldsCollectionGroup: computed(function resultsFieldsCollectionGroup() {
    return createFunctionResultsGroup(
      this,
      this.get('reservedResultNames')
    );
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormElement>}
   */
  configParametersField: computed(function configParametersField() {
    return AtmParameterSpecsEditor
      .extend(disableFieldInEditMode(this))
      .create({
        name: 'configParameters',
        label: this.t('fields.configParameters.label'),
        addButtonText: this.t('fields.configParameters.addButtonText'),
        classes: 'input-output-data-collection',
      });
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
        cpuRequestedDefaultValueMixin: {},
        cpuLimitDefaultValueMixin: {},
        memoryRequestedDefaultValueMixin: {},
        memoryLimitDefaultValueMixin: {},
        ephemeralStorageRequestedDefaultValueMixin: {},
        ephemeralStorageLimitDefaultValueMixin: {},
      }),
    });
  }),

  fieldsResetter: observer('mode', 'revision', function fieldsResetter() {
    const {
      fields,
      fieldsValuesFromRecord,
    } = this.getProperties('fields', 'fieldsValuesFromRecord');
    set(fields, 'valuesSource', fieldsValuesFromRecord);
    fields.useCurrentValueAsDefault();
    fields.reset();
  }),

  init() {
    this._super(...arguments);

    this.fieldsResetter();
  },

  /**
   * @override
   */
  willDestroyElement() {
    try {
      this.cacheFor('fields')?.destroy();
    } finally {
      this._super(...arguments);
    }
  },

  actions: {
    cancel() {
      this.get('onCancel')();
    },
    submit() {
      const {
        mode,
        revision,
        fields,
        onSubmit,
      } = this.getProperties('mode', 'revision', 'fields', 'onSubmit');
      this.set('isSubmitting', true);

      const rawAtmLambdaFromForm = formDataToRecord(fields.dumpValue());
      const objectToSubmit = {};

      if (mode === 'create') {
        Object.assign(objectToSubmit, rawAtmLambdaFromForm);
      } else if (mode === 'edit' && revision) {
        const origStateVal = get(revision, 'state');
        const newStateVal = get(rawAtmLambdaFromForm, 'state');
        if (origStateVal !== newStateVal) {
          objectToSubmit.state = newStateVal;
        }
      }

      return onSubmit(objectToSubmit)
        .then(() => mode === 'create' && fields.reset())
        .finally(() => {
          trySet(this, 'isSubmitting', false);
        });
    },
  },
});

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
 * Generates a form collection group for results
 * @param {Components.ContentAtmInventoriesLambdas.AtmLambdaForm} component
 * @param {Array<String>} reservedNames values of `entryName` field, which should be
 * considered incorrect (reserved)
 * @returns {Utils.FormComponent.FormFieldsCollectionGroup}
 */
function createFunctionResultsGroup(component, reservedNames = []) {
  const generateEntryNameField = mode => TextField.create({
    mode,
    name: 'entryName',
    defaultValue: '',
    customValidators: [
      validator('inline', {
        validate(value, options, model) {
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
        },
        dependentKeys: ['model.field.parent.parent.usedEntryNames'],
      }),
      validator('exclusion', { in: reservedNames }),
    ],
  });
  const generateEntryDataSpecField = mode => {
    const field = DataSpecEditor.create({
      ownerSource: component,
      name: 'entryDataSpec',
    });
    field.changeMode(mode);
    return field;
  };
  const generateEntryIsViaFileField = mode => ToggleField.extend({
    addColonToLabel: or('component.media.isMobile', 'component.media.isTablet'),
  }).create({
    classes: 'right-floating-toggle',
    mode,
    name: 'entryIsViaFile',
    defaultValue: false,
    component,
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
          generateEntryDataSpecField(mode),
          generateEntryIsViaFileField(mode),
        ],
      });
    },
    dumpDefaultValue() {
      return this.get('defaultValue') || this._super(...arguments);
    },
  };
  return FormFieldsCollectionGroup.extend(
    disableFieldInEditMode(component),
    fieldsCollectionExtension
  ).create({
    name: 'results',
    classes: 'input-output-data-collection',
  });
}
