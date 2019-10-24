import OneForm from 'onedata-gui-common/components/one-form';
import EmberObject, { computed, getProperties, set, get } from '@ember/object';
import { union } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import { buildValidations } from 'ember-cp-validations';

const nameField = {
  name: 'name',
  type: 'text',
  defaultValue: '',
};

const validUntilEnabledField = {
  name: 'validUntilEnabled',
  type: 'checkbox',
  defaultValue: false,
};

const validUntilField = {
  name: 'validUntil',
  type: 'datetime',
};

const generalFields = [
  nameField,
  validUntilEnabledField,
];

const validUntilFields = [
  validUntilField,
];

const allPrefixes = [
  'general',
  'validUntil',
];

const validationsProto = {};
[
  ['general', generalFields],
  ['validUntil', validUntilFields],
].forEach(([prefix, fields]) => {
  fields.forEach((field) => {
    const validators = createFieldValidator(field);
    validationsProto[`allFieldsValues.${prefix}.${field.name}`] = validators;
  });
});

export default OneForm.extend(I18n, buildValidations(validationsProto), {
  classNames: ['new-token-form'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensNew.newTokenForm',

  /**
   * @virtual optional
   * @type {Object|undefined}
   */
  initialValues: undefined,

  /**
   * @type {Function}
   * @param {Object} formState Object in format:
   *   ```
   *     {
   *       isValid: boolean,
   *       values: Object, // all form values
   *     }
   *   ```
   */
  onChange: notImplementedIgnore,

  /**
   * @type {Function}
   * @param {Object} formState object with the same format as in `onChange`
   */
  onCreate: notImplementedThrow,

  /**
   * @type {Object}
   */
  formLayoutConfig: Object.freeze({
    formLabelColumns: 'col-xs-12 col-sm-4',
    formInputColumns: 'col-xs-12 col-sm-8',
    formSubmitColumns: 'col-xs-12 text-center',
    formToggleLabelColumns: 'col-xs-6 col-sm-4',
    formToggleInputColumns: 'col-xs-6 col-sm-8 text-xs-right',
  }),

  /**
   * @override
   */
  currentFieldsPrefix: computed(function () {
    return ['general', 'validUntil'];
  }),

  /**
   * @override
   */
  allFieldsValues: computed('provider', 'allFields', function () {
    let values = EmberObject.create();
    allPrefixes.forEach((prefix) => values.set(prefix, EmberObject.create()));
    return values;
  }),

  /**
   * @override
   */
  allFields: union(
    'generalFields',
    'validUntilFields',
  ),

  generalFieldsSource: Object.freeze([
    nameField,
    validUntilEnabledField,
  ]),

  validUntilFieldsSource: Object.freeze([
    validUntilField,
  ]),

  generalFields: computed('generalFieldsSource.[]', function generalFields() {
    return this.get('generalFieldsSource')
      .map(field => this.preprocessField(field, 'general'));
  }),

  validUntilFields: computed('validUntilFieldsSource.[]', function validUntilFields() {
    return this.get('validUntilFieldsSource')
      .map(field => this.preprocessField(field, 'validUntil'));
  }),

  preprocessField(field, prefix) {
    const {
      name,
      tip,
      defaultValue,
    } = getProperties(field, 'name', 'tip', 'defaultValue');

    if (defaultValue !== undefined) {
      this.set(`allFieldsValues.${prefix}.${name}`, defaultValue);
    }

    return EmberObject.create(field, {
      name: `${prefix}.${name}`,
      label: this.t(`fields.${name}.label`),
      tip: tip ? this.t(`fields.${name}.tip`) : undefined,
    });
  },

  init() {
    this._super(...arguments);

    this.prepareFields();
    this.injectInitialValues();
    this.notifyChange();
  },

  injectInitialValues() {
    const {
      initialValues,
      allFieldsValues,
    } = this.getProperties('initialValues', 'allFieldsValues');

    if (initialValues) {
      const {
        name,
        validUntilEnabled,
        validUntil,
      } = getProperties(initialValues, 'name', 'validUntilEnabled', 'validUntil');

      if (name) {
        set(allFieldsValues, 'general.name', name);
      }
      if (validUntilEnabled !== undefined) {
        set(allFieldsValues, 'general.validUntilEnabled', Boolean(validUntilEnabled));
      }
      if (validUntil) {
        set(allFieldsValues, 'validUntil.validUntil', validUntil);
      }
    }
  },

  notifyChange() {
    const {
      allFieldsValues,
      onChange,
      isValid,
    } = this.getProperties('allFieldsValues', 'onChange', 'isValid');
    const {
      name,
      validUntilEnabled,
    } = getProperties(
      get(allFieldsValues, 'general'),
      'name',
      'validUntilEnabled'
    );
    const validUntil = get(allFieldsValues, 'validUntil.validUntil');

    const values = {
      name,
      validUntilEnabled,
      validUntil,
    };

    onChange({
      isValid,
      values,
    });
  },

  getFormState() {
    const {
      allFieldsValues,
      isValid,
    } = this.getProperties('allFieldsValues', 'isValid');
    const {
      name,
      validUntilEnabled,
    } = getProperties(
      get(allFieldsValues, 'general'),
      'name',
      'validUntilEnabled'
    );
    const validUntil = get(allFieldsValues, 'validUntil.validUntil');

    const values = {
      name,
      validUntilEnabled,
      validUntil,
    };

    return {
      isValid,
      values,
    };
  },

  actions: {
    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
      this.notifyChange();
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    create() {
      this.get('onCreate')(this.getFormState());
    },
  },
});
