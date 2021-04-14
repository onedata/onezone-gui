/**
 * Allows to create new and show existing lambda function records.
 * NOTE: it does not persist data. To save created lambda function, you need
 * to do it on your own by providing `onSubmit` (which should return a promise).
 *
 * @module components/authorizers-dropdown
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, observer } from '@ember/object';
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
import { tag, eq, or, not, and, raw, isEmpty, conditional, getBy } from 'ember-awesome-macros';
import notImplementedReject from 'onedata-gui-common/utils/not-implemented-reject';
import {
  formDataToRecord,
  recordToFormData,
} from 'onezone-gui/utils/content-workflow-functions/lambda-function-form-utils';

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
   * Record to visualise in `view` mode (so in that mode it is a required field).
   * @virtual optional
   * @type {Models.LambdaFunction}
   */
  lambdaFunction: undefined,

  /**
   * Required when `mode` is `create`
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
    return recordToFormData(this.get('lambdaFunction'));
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
      onedataFunctionOptionsFieldsGroup,
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
      'onedataFunctionOptionsFieldsGroup',
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
        onedataFunctionOptionsFieldsGroup,
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
    const viewOptions = [
      { value: 'openfaas' },
      { value: 'onedataFunction' },
    ];
    const editOptions = viewOptions.rejectBy('value', 'onedataFunction');

    return DropdownField
      .extend(defaultValueGenerator(this, 'options.firstObject.value'), {
        options: conditional('isInViewMode', raw(viewOptions), raw(editOptions)),
      })
      .create({
        name: 'engine',
        showSearch: false,
      });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  openfaasOptionsFieldsGroup: computed(function openfaasOptionsFieldsGroup() {
    return FormFieldsGroup.extend({
      isVisible: eq('valuesSource.engine', raw('openfaas')),
    }).create({
      name: 'openfaasOptions',
      fields: [
        TextField.extend(defaultValueGenerator(this, raw(''))).create({
          name: 'dockerImage',
        }),
      ],
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  onedataFunctionOptionsFieldsGroup: computed(
    function onedataFunctionOptionsFieldsGroup() {
      return FormFieldsGroup.extend({
        isVisible: eq('valuesSource.engine', raw('onedataFunction')),
      }).create({
        name: 'onedataFunctionOptions',
        fields: [
          TextField.extend(defaultValueGenerator(this, raw(''))).create({
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
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  readonlyField: computed(function readonlyField() {
    return ToggleField.extend(defaultValueGenerator(this, raw(true))).create({
      name: 'readonly',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.ToggleField>}
   */
  mountSpaceField: computed(function mountSpaceField() {
    return ToggleField.extend(defaultValueGenerator(this, raw(true)), {
      isVisible: eq('valuesSource.engine', raw('openfaas')),
    }).create({
      name: 'mountSpace',
    });
  }),

  /**
   * @type {ComputedProperty<Utils.FormComponent.FormFieldsGroup>}
   */
  mountSpaceOptionsFieldsGroup: computed(function mountSpaceOptionsFieldsGroup() {
    return FormFieldsGroup.extend({
      isVisible: or('isInEditMode', 'valuesSource.mountSpace'),
      isExpanded: or('isInViewMode', 'valuesSource.mountSpace'),
    }).create({
      name: 'mountSpaceOptions',
      fields: [
        TextField.extend(defaultValueGenerator(this, raw('/mnt/onedata'))).create({
          name: 'mountPoint',
        }),
        TextField.extend(defaultValueGenerator(this, raw(''))).create({
          name: 'oneclientOptions',
          isOptional: true,
        }),
      ],
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

      const lambdaFunction = formDataToRecord(fields.dumpValue());
      return onSubmit(lambdaFunction);
    },
  },
});

/**
 * Generates mixin-like object, that specifies default value for field. Value in "view" mode
 * is taken from component, in "edit" mode is equal to passed `editDefaultValue`.
 * It's result should be passed to *Field.extend.
 * @param {Components.ContentWorkflowFunctions.LambdaFunctionForm} component
 * @param {any} editDefaultValue
 * @returns {Object}
 */
function defaultValueGenerator(component, editDefaultValue) {
  return {
    defaultValueSource: component,
    defaultValue: conditional(
      'isInViewMode',
      getBy('defaultValueSource', tag `fieldsViewValues.${'path'}`),
      editDefaultValue
    ),
  };
}

/**
 * Generates a form collection group for arguments and results (as they are very
 * similar).
 * @param {Components.ContentWorkflowFunctions.LambdaFunctionForm} component
 * @param {String} dataType one of: `argument`, `result`
 * @returns {Utils.FormComponent.FormFieldsCollectionGroup}
 */
function createFunctionArgResGroup(component, dataType) {
  const isForArguments = dataType === 'argument';
  return FormFieldsCollectionGroup
    .extend(defaultValueGenerator(component, raw(undefined)), {
      isVisible: not(and('isInViewMode', isEmpty('value.__fieldsValueNames'))),
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
                { value: 'onedatafsOptions' },
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
    })
    .create({
      name: isForArguments ? 'arguments' : 'results',
    });
}
