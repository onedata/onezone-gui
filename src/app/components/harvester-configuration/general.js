import OneForm from 'onedata-gui-common/components/one-form';
import { inject as service } from '@ember/service';
import EmberObject, {
  get,
  set,
  observer,
  computed,
  getProperties,
  setProperties,
} from '@ember/object';
import { union } from '@ember/object/computed';
import { buildValidations } from 'ember-cp-validations';
import createFieldValidator from 'onedata-gui-common/utils/create-field-validator';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { next } from '@ember/runloop';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import config from 'ember-get-config';

const {
  layoutConfig,
} = config;

const fieldDefinitions = [{
  name: 'name',
  type: 'text',
}, {
  name: 'plugin',
  type: 'dropdown',
  options: [],
}, {
  name: 'endpoint',
  type: 'text',
}];

const allPrefixes = [
  'view',
  'edit',
];

const validationsProto = {};
fieldDefinitions.forEach((field) => {
  const validators = createFieldValidator(field);
  validationsProto[`allFieldsValues.edit.${field.name}`] = validators;
});

export default OneForm.extend(I18n, buildValidations(validationsProto), {
  classNames: ['harvester-configuration-general'],

  i18n: service(),
  harvesterManager: service(),
  harvesterActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.general',

  /**
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * One of: `view`, `edit`, `create`
   * @type {string}
   */
  mode: 'view',

  /**
   * @type {boolean}
   */
  disabled: false,

  /**
   * @override
   */
  currentFieldsPrefix: computed('mode', function currentFieldsPrefix() {
    const mode = this.get('mode');
    switch (mode) {
      case 'view':
        return ['view'];
      case 'edit':
      case 'create':
        return ['edit'];
    }
  }),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  formLayoutConfig: computed('mode', function formLayoutConfig() {
    if (this.get('mode') === 'create') {
      return {
        formLabelColumns: 'col-xs-12 col-sm-3',
        formInputColumns: 'col-xs-12 col-sm-9',
        formSubmitColumns: 'col-xs-12 text-center',
        formToggleLabelColumns: 'col-xs-6 col-sm-3',
        formToggleInputColumns: 'col-xs-6 col-sm-9',
      };
    } else {
      return layoutConfig;
    }
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  viewFields: computed(function viewFields() {
    return fieldDefinitions.map(field => this.preprocessField(field, 'view', true));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editFields: computed(function editFields() {
    return fieldDefinitions.map(field => this.preprocessField(field, 'edit'));
  }),

  /**
   * @override
   */
  allFields: union('viewFields', 'editFields'),

  /**
   * @override
   */
  allFieldsValues: computed('provider', 'allFields', function () {
    let values = EmberObject.create();
    allPrefixes.forEach((prefix) => values.set(prefix, EmberObject.create()));
    return values;
  }),

  /**
   * Available harvester plugins list
   * @returns {Ember.ComputedProperty<PromiseArray<string>>}
   */
  pluginTypes: computed(function pluginTypes() {
    return this.get('harvesterManager').getPluginsList();
  }),

  harvesterObserver: observer(
    'harvester.{name,plugin,endpoint}',
    function harvesterObserver() {
      const {
        harvester,
        allFields,
        allFieldsValues,
      } = this.getProperties('harvester', 'allFields', 'allFieldsValues');
      if (harvester) {
        [
          'name',
          'plugin',
          'endpoint',
        ].forEach(valueName => {
          const value = get(harvester, valueName);

          const editorFieldName = `edit.${valueName}`;
          const editorField = allFields.findBy('name', editorFieldName);
          set(editorField, 'defaultValue', value);
          if (!get(editorField, 'changed')) {
            set(allFieldsValues, editorFieldName, value);
          }

          const viewFieldName = `view.${valueName}`;
          const viewField = allFields.findBy('name', viewFieldName);
          set(viewField, 'defaultValue', value);
          set(allFieldsValues, viewFieldName, value);
        });
      }
    }
  ),

  modeObserver: observer('mode', function modeObserver() {
    const {
      mode,
      pluginTypes,
      allFields,
    } = this.getProperties('mode', 'pluginTypes', 'allFields');
    if (mode === 'create') {
      set(
        allFields.findBy('name', 'edit.plugin'),
        'defaultValue',
        pluginTypes.objectAt(0) || undefined
      );
    }
    this.resetFormValues(allPrefixes);
  }),

  init() {
    this._super(...arguments);
    this.get('pluginTypes').then(pluginTypes => safeExec(this, () => {
      const options = pluginTypes.map(type => ({
        label: type,
        value: type,
      }));
      set(this.get('allFields').findBy('name', 'edit.plugin'), 'options', options);

      this.prepareFields();
      this.harvesterObserver();
      next(() => this.modeObserver());
    }));
  },

  /**
   * Performs initial field setup.
   * @param {FieldType} field Field
   * @param {string} prefix Field prefix
   * @param {boolean} isStatic Should field be static
   * @returns {object} prepared field
  */
   preprocessField(field, prefix, isStatic = false) {
    field = EmberObject.create(field);
    const {
      name,
      tip,
      type,
    } = getProperties(field, 'name', 'tip', 'type');
    setProperties(field, {
      name: `${prefix}.${name}`,
      label: this.t(`fields.${name}.label`),
      tip: tip ? this.t(`fields.${name}.tip`) : undefined,
      type: isStatic ? 'static' : type,
    });

    return field;
  },

  actions: {
    edit() {
      this.set('mode', 'edit');
    },

    cancel() {
      this.set('mode', 'view');
    },

    inputChanged(fieldName, value) {
      this.changeFormValue(fieldName, value);
    },

    focusOut(field) {
      field.set('changed', true);
      this.recalculateErrors();
    },

    submit() {
      const {
        formValues,
        mode,
        harvester,
        harvesterActions,
      } = this.getProperties(
        'formValues',
        'mode',
        'harvester',
        'harvesterActions'
      );
      const valueNames = ['name', 'plugin', 'endpoint'];
      const values = getProperties(get(formValues, 'edit'), ...valueNames);
      
      this.set('disabled', true);
      let promise;
      switch (mode) {
        case 'edit': {
          const oldValues = getProperties(harvester, ...valueNames);
          setProperties(harvester, values);
          promise = harvesterActions.updateHarvester(harvester)
            .then(() => safeExec(this, () => {
              this.set('mode', 'view');
            }))
            .catch(() => setProperties(harvester, oldValues));
          break;
        }
        case 'create':
          promise = harvesterActions.createHarvester(values);
      }
      return promise.finally(() =>
        safeExec(this, () => this.set('disabled', false))
      );
    },
  },
});
