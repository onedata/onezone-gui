/**
 * Harvester configuration section responsible general harvester options.
 *
 * @module components/harvester-configuration/general
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

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
import { scheduleOnce } from '@ember/runloop';

const {
  layoutConfig,
} = config;

const viewCreateFieldDefinitions = [{
  name: 'name',
  type: 'text',
}, {
  name: 'plugin',
  type: 'dropdown',
  options: [],
}];

const viewEditFieldDefinitions = [{
  name: 'endpoint',
  type: 'text',
  optional: true,
}, {
  name: 'public',
  type: 'checkbox',
  defaultValue: false,
}];

const publicUrlFieldDefinition = [{
  name: 'publicUrl',
  type: 'clipboard-line',
}];

const allPrefixes = [
  'view',
  'create',
  'edit',
  'publicUrl',
];

const validationsProto = {};
viewCreateFieldDefinitions.forEach((field) => {
  const validators = createFieldValidator(field);
  validationsProto[`allFieldsValues.create.${field.name}`] = validators;
});
viewCreateFieldDefinitions.concat(viewEditFieldDefinitions).forEach((field) => {
  const validators = createFieldValidator(field);
  validationsProto[`allFieldsValues.edit.${field.name}`] = validators;
});

export default OneForm.extend(I18n, buildValidations(validationsProto), {
  classNames: ['harvester-configuration-general'],

  i18n: service(),
  harvesterManager: service(),
  harvesterActions: service(),
  router: service(),

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
   * @type {Location}
   */
  _location: location,

  /**
   * @override
   */
  currentFieldsPrefix: computed(
    'mode',
    'allFieldsValues.edit.public',
    function currentFieldsPrefix() {
      const mode = this.get('mode');
      const isPublic = this.get('allFieldsValues.edit.public');
      switch (mode) {
        case 'view':
        case 'edit': {
          const prefixes = [mode];
          if (isPublic) {
            prefixes.push('publicUrl');
          }
          return prefixes;
        }
        case 'create':
          return ['create'];
      }
    }
  ),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  formLayoutConfig: computed('mode', function formLayoutConfig() {
    if (this.get('mode') === 'create') {
      return {
        formLabelColumns: 'col-xs-12 col-sm-3 col-md-2',
        formInputColumns: 'col-xs-12 col-sm-9 col-md-10',
        formSubmitColumns: 'col-xs-12 text-center',
        formToggleLabelColumns: 'col-xs-6 col-sm-3 col-md-2',
        formToggleInputColumns: 'col-xs-6 col-sm-9 col-md-10',
      };
    } else {
      return layoutConfig;
    }
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  viewFields: computed(function viewFields() {
    return viewCreateFieldDefinitions.concat(viewEditFieldDefinitions)
      .map(field => this.preprocessField(field, 'view', true));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  createFields: computed(function createFields() {
    return viewCreateFieldDefinitions
      .map(field => this.preprocessField(field, 'create'));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  editFields: computed(function editFields() {
    return viewCreateFieldDefinitions.concat(viewEditFieldDefinitions)
      .map(field => this.preprocessField(field, 'edit'));
  }),

  /**
   * @type {Ember.ComputedProperty<Array<FieldType>>}
   */
  publicUrlField: computed(function publicUrlField() {
    return publicUrlFieldDefinition
      .map(field => this.preprocessField(field, 'publicUrl'));
  }),

  /**
   * @override
   */
  allFields: union(
    'viewFields',
    'createFields',
    'editFields',
    'publicUrlField'
  ),

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

  /**
   * @type {Ember.ComputedProperty<string|null>}
   */
  publicUrlValue: computed('harvester.entityId', function publicUrlValue() {
    const harvesterEntityId = this.get('harvester.entityId');
    if (harvesterEntityId) {
      const {
        router,
        _location,
      } = this.getProperties('router', '_location');
  
      const {
        origin,
        pathname,
      } = getProperties(_location, 'origin', 'pathname');
  
      return origin + pathname +
        router.urlFor('public-harvester', harvesterEntityId);
    } else {
      return null;
    }
  }),

  harvesterObserver: observer(
    'harvester.{name,plugin,endpoint,public}',
    function harvesterObserver() {
      const {
        harvester,
        allFields,
        allFieldsValues,
        publicUrlValue,
      } = this.getProperties(
        'harvester',
        'allFields',
        'allFieldsValues',
        'publicUrlValue'
      );
      if (harvester) {
        [
          'name',
          'plugin',
          'endpoint',
          'public',
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
        const publicUrlFieldName = 'publicUrl.publicUrl';
        const publicUrlField = allFields.findBy('name', publicUrlFieldName);
        set(publicUrlField, 'defaultValue', publicUrlValue);
        set(allFieldsValues, publicUrlFieldName, publicUrlValue);
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
      const defaultPlugin = pluginTypes.objectAt(0);
      set(
        allFields.findBy('name', 'create.plugin'),
        'defaultValue',
        defaultPlugin ? get(defaultPlugin, 'id') : undefined
      );
    }
    this.resetFormValues(allPrefixes);
  }),

  init() {
    this._super(...arguments);
    this.get('pluginTypes').then(pluginTypes => safeExec(this, () => {
      const options = pluginTypes.map(({ id, name }) => ({
        label: name,
        value: id,
      }));
      const allFields = this.get('allFields');
      set(allFields.findBy('name', 'create.plugin'), 'options', options);
      set(allFields.findBy('name', 'edit.plugin'), 'options', options);

      this.prepareFields();
      this.harvesterObserver();
      next(() => this.modeObserver());
    }));
  },

  didInsertElement() {
    this._super(...arguments);

    const mode = this.get('mode');
    if (mode !== 'view') {
      this.get('pluginTypes').then(() => {
        scheduleOnce(
          'afterRender',
          this,
          () => this.$(`.field-${mode}-name`).focus()
        );
      });
    }
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
      const valueNames = ['name', 'plugin'];
      if (mode === 'edit') {
        valueNames.push('endpoint', 'public');
      }
      const values = getProperties(get(formValues, mode), ...valueNames);
      if (!get(values, 'endpoint')) {
        set(values, 'endpoint', null);
      }
      
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
