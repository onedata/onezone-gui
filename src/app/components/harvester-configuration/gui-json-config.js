import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';

export default Component.extend(I18n, {
  classNames: ['harvester-configuration-gui-json-config'],

  i18n: service(),
  globalNotify: service(),
  harvesterManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration.guiPlugin.guiJsonConfig',

  /**
   * @type {string}
   */
  mode: 'view',

  /**
   * @virtual
   * @type {Model.Harvester}
   */
  harvester: undefined,

  /**
   * @type {boolean}
   */
  isSaving: false,

  /**
   * @type {string|Ember.ComputedProperty<string>}
   */
  editorValue: '',

  /**
   * Set by `updateEditorValue` method
   * @type {boolean}
   */
  isValid: true,

  /**
   * @type {Ember.ComputedProperty<PromiseObject<models.HarvesterConfiguration>>}
   */
  configurationProxy: computed(function configurationProxy() {
    const {
      harvester, 
      harvesterManager,
    } = this.getProperties('harvester', 'harvesterManager');
    return PromiseObject.create({
      promise: harvesterManager.getConfig(get(harvester, 'entityId')),
    });
  }),

  modeObserver: observer('mode', function modeObserver() {
    this.updateEditorValue();
  }),

  init() {
    this._super(...arguments);
    this.modeObserver();
  },

  /**
   * Updates editor value depending on mode and passed (optional) value
   * @param {string} [value]
   * @param {boolean} [isValid]
   * @returns {undefined}
   */
  updateEditorValue(value, isValid) {
    const {
      mode,
      configurationProxy,
    } = this.getProperties('mode', 'configurationProxy');
    let editorValue;
    if (mode === 'view') {
      editorValue = reads('configurationProxy.stringifiedConfig');
    } else if (value === undefined) {
      editorValue = get(configurationProxy, 'stringifiedConfig');
    } else {
      editorValue = value;
    }
    if (isValid === undefined) {
      isValid = true;
    }
    this.setProperties({
      editorValue: editorValue,
      isValid,
    });
  },

  actions: {
    edit() {
      this.set('mode', 'edit');
    },
    cancel() {
      this.set('mode', 'view');
    },
    save() {
      this.set('isSaving', true);

      const {
        editorValue,
        configurationProxy,
        globalNotify,
      } = this.getProperties(
        'editorValue',
        'configurationProxy',
        'globalNotify'
      );
      const configuration = get(configurationProxy, 'content');

      let newConfig = {};
      if (!isNone(editorValue) && editorValue !== '') {
        try {
          newConfig = JSON.parse(editorValue);
        } catch (e) {
          console.warn('gui-json-config: cannot parse gui plugin configuration', e);
        }
      }

      const oldConfig = get(configuration, 'config');
      set(configuration, 'config', newConfig);
      return configuration.save()
        .then(() => {
          globalNotify.info(this.t('configurationSaveSuccess'));
          safeExec(this, () => {
            this.set('mode', 'view');
          });
        })
        .catch(error => {
          set(configuration, 'config', oldConfig);
          globalNotify.backendError(this.t('savingConfiguration'), error);
        })
        .finally(() => {
          safeExec(this, () => {
            this.set('isSaving', false);
          });
        });
    },
    configurationChange({value, isValid}) {
      this.updateEditorValue(value, isValid);
    },
  },
});
