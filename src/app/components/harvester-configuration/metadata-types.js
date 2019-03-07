import Component from '@ember/component';
import EmberObject, { computed, observer, get, getProperties, setProperties } from '@ember/object';
import { and } from '@ember/object/computed';
import { A } from '@ember/array';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { resolve, reject } from 'rsvp';

export default Component.extend(I18n, {
  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.metadataTypes',

  /**
   * @virtual
   * @type {string}
   */
  mode: 'view',

  /**
   * @virtual
   * @type {string}
   */
  typeField: undefined,

  /**
   * @virtual
   * @type {Array<Object>}
   */
  acceptedTypes: undefined,

  /**
   * @virtual
   * @type {string}
   */
  defaultType: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  disabled: false,

  /**
   * @type {Function}
   * @param {Object} value
   * @param {boolean} isValid
   */
  onChange: notImplementedThrow,

  /**
   * @type {Object}
   */
  dataToDisplay: Object.freeze({}),

  /**
   * @type {boolean}
   */
  isTypeFieldValid: false,

  /**
   * @type {Ember.ComputedProperty<Array<Object>>}
   */
  defaultTypeOptions: computed(
    'dataToDisplay.acceptedTypes.@each.name',
    function defaultTypeOptions() {
      const types = this.get('dataToDisplay.acceptedTypes') || [];
      return [{
        name: this.t('noneType'),
        value: null,
      }].concat(types.map(type => {
        const name = get(type, 'name');
        return {
          name,
          value: name,
        };
      }));
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  areAcceptedTypesValid: computed(
    'dataToDisplay.acceptedTypes.@each.isValid',
    function areAcceptedTypesValid() {
      const acceptedTypes = this.get('dataToDisplay.acceptedTypes');
      return get(acceptedTypes, 'length') && acceptedTypes.isEvery('isValid');
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isValid: and('isTypeFieldValid', 'areAcceptedTypesValid'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  allowAddingNewType: computed(
    'dataToDisplay.acceptedTypes.@each.isCreating',
    function allowAddingNewType() {
      return !this.get('dataToDisplay.acceptedTypes').isAny('isCreating');
    }
  ),

  modeObserver: observer('mode', function modeObserver() {
    const {
      typeField,
      acceptedTypes,
      defaultType,
    } = this.getProperties(
      'typeField',
      'acceptedTypes',
      'defaultType'
    );
    this.set('dataToDisplay', EmberObject.create({
      typeField,
      acceptedTypes: A(acceptedTypes.map(type => {
        const {
          name,
          schema,
        } = getProperties(type, 'name', 'schema');
        return EmberObject.create({
          name,
          schema: schema ? JSON.stringify(schema, null, 2) : '',
          isValid: true,
        });
      })),
    }));
    const defaultTypeOptions = this.get('defaultTypeOptions');
    const defaultTypeOption = defaultTypeOptions.findBy('value', defaultType) ||
      defaultTypeOptions.objectAt(0);
    this.set('dataToDisplay.defaultType', defaultTypeOption);
  }),

  init() {
    this._super(...arguments);
    this.modeObserver();
  },

  /**
   * @returns {undefined}
   */
  notifyChange() {
    const {
      dataToDisplay,
      isValid,
      onChange,
    } = this.getProperties('dataToDisplay', 'isValid', 'onChange');
    const {
      typeField,
      acceptedTypes,
      defaultType,
    } = getProperties(dataToDisplay, 'typeField', 'acceptedTypes', 'defaultType');
    onChange({
      entryTypeField: typeField,
      acceptedEntryTypes: acceptedTypes.map(type => {
        const {
          name,
          schema,
          isValid,
        } = getProperties(type, 'name', 'schema', 'isValid');
        return {
          name,
          schema: (schema && isValid) ? JSON.parse(schema) : null,
        };
      }),
      defaultEntryType: get(defaultType, 'value'),
    }, isValid);
  },

  actions: {
    onTypeFieldChange(value) {
      this.set('isTypeFieldValid', !!value);
      this.set('dataToDisplay.typeField', value);
      this.notifyChange();
    },
    addType() {
      this.get('dataToDisplay.acceptedTypes').pushObject(EmberObject.create({
        name: '',
        schema: '',
        isCreating: true,
      }));
    },
    onCancelNewTypeEdition(type) {
      this.get('dataToDisplay.acceptedTypes').removeObject(type);
    },
    onNewTypeNameChange(type, value) {
      if (!value) {
        return reject();
      } else {
        setProperties(type, {
          name: value,
          isCreating: undefined,
        });
        this.notifyChange();
        return resolve();
      }
    },
    onTypeSchemaChange(type, { value, isValid}) {
      setProperties(type, {
        schema: value,
        isValid,
      });
      this.notifyChange();
    },
    removeType(type) {
      this.get('dataToDisplay.acceptedTypes').removeObject(type);
      if (this.get('dataToDisplay.defaultType.value') === get(type, 'name')) {
        this.set(
          'dataToDisplay.defaultType',
          this.get('defaultTypeOptions'
        ).objectAt(0));
      }
      this.notifyChange();
    },
    onDefaultTypeChange(type) {
      this.set('dataToDisplay.defaultType', type);
      this.notifyChange();
    },
  },
});
