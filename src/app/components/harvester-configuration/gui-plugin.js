import Component from '@ember/component';
import EmberObject, { observer, getProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import notImplementedThrow from 'onedata-gui-common/utils/not-implemented-throw';
import { scheduleOnce } from '@ember/runloop';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.guiPlugin',

  /**
   * @virtual
   * @type {string}
   */
  mode: 'view',

  /**
   * @virtual
   * @type {string}
   */
  pathPrefix: '/',

  /**
   * @virtual
   * @type {boolean}
   */
  disabled: false,

  /**
   * @type {string}
   */
  path: '',

  /**
   * @type {Object}
   */
  configuration: Object.freeze({}),

  /**
   * @type {Function}
   * @param {Object} value
   * @param {boolean} isValid
   */
  onChange: notImplementedThrow,

  /**
   * @type {boolean}
   */
  isConfigurationValid: true,

  /**
   * @type {Object}
   */
  dataToDisplay: Object.freeze({}),

  /**
   * @type {Cleave|null}
   */
  pathCleave: null,

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isValid: reads('isConfigurationValid'),

  modeObserver: observer('mode', function modeObserver() {
    const {
      configuration,
      path,
      pathCleave,
    } = this.getProperties('configuration', 'path', 'pathCleave');
    this.set('dataToDisplay', EmberObject.create({
      configuration,
      path,
    }));
    if (pathCleave) {
      pathCleave.destroy();
      this.set('pathCleave', null);
    }
    scheduleOnce('afterRender', this, 'addPrefixToPathInput');
  }),

  init() {
    this._super(...arguments);
    this.modeObserver();
  },

  /**
   * @returns {HTMLInputElement|undefined}
   */
  getPathInput() {
    return this.$(`input#${this.get('elementId')}-gui-plugin-path`)[0];
  },

  /**
   * @returns {undefined}
   */
  addPrefixToPathInput() {
    const input = this.getPathInput();
    if (input) {
      const cleaveInstance = new window.Cleave(input, {
        prefix: this.get('pathPrefix'),
        onValueChanged: ({ target: { value } }) => {
          if (this.get('pathCleave')) {
            this.set('dataToDisplay.path', value);
            this.notifyChange();
          }
        },
      });
      cleaveInstance.setRawValue(this.get('dataToDisplay.path'));
      this.set('pathCleave', cleaveInstance);
    }
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
      configuration,
      path,
    } = getProperties(dataToDisplay, 'configuration', 'path');
    onChange({
      guiPluginConfiguration: configuration,
      guiPluginPath: path,
    }, isValid);
  },

  actions: {
    onConfigurationChange({ value, isValid }) {
      this.set('isConfigurationValid', isValid);
      this.set('dataToDisplay.configuration', value);
      this.notifyChange();
    },
  },
});
