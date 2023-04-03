// TODO: VFS-9257 fix eslint issues in this file
/* eslint-disable no-param-reassign */

/**
 * Harvester configuration section responsible for gui plugin JSON config setup.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { get, set, computed, observer, defineProperty } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { not, and, promise } from 'ember-awesome-macros';

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
   * @virtual
   * @type {utils.harvesterConfiguration.GuiPluginManifest}
   */
  manifestProxy: undefined,

  /**
   * @virtual
   * @type {boolean}
   */
  isUploadingGui: false,

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
   * @type {Ember.ComputedProperty<PromiseObject<models.HarvesterGuiPluginConfig>>}
   */
  configurationProxy: promise.object(computed(function configurationProxy() {
    const {
      harvester,
      harvesterManager,
    } = this.getProperties('harvester', 'harvesterManager');
    return harvesterManager.getGuiPluginConfig(get(harvester, 'entityId'));
  })),

  /**
   * @type {Ember.ComputedProperty<Object|undefined>}
   */
  defaultConfiguration: reads('manifestProxy.defaultGuiConfigurationStringified'),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isUseDefaultsEnabled: and(
    not('isUploadingGui'),
    not('isSaving'),
    'defaultConfiguration'
  ),

  /**
   * @type {Ember.ComputedProperty<PromiseAray>}
   */
  dataLoadingProxy: promise.array(promise.all(
    'configurationProxy',
    'manifestProxy'
  )),

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
    if (mode === 'view') {
      defineProperty(
        this,
        'editorValue',
        reads('configurationProxy.guiPluginConfigStringified')
      );
    } else {
      const propertyValue = value === undefined ?
        get(configurationProxy, 'guiPluginConfigStringified') : value;
      defineProperty(
        this,
        'editorValue',
        undefined,
        propertyValue
      );
    }
    this.notifyPropertyChange('editorValue');
    this.set('isValid', isValid === undefined ? true : isValid);
  },

  actions: {
    edit() {
      this.set('mode', 'edit');
    },
    useDefaults() {
      const defaultConfiguration = this.get('defaultConfiguration');
      this.updateEditorValue(defaultConfiguration, true);
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

      const oldConfig = get(configuration, 'guiPluginConfig');
      set(configuration, 'guiPluginConfig', newConfig);
      return configuration.save()
        .then(() => {
          globalNotify.info(this.t('configurationSaveSuccess'));
          safeExec(this, () => {
            this.set('mode', 'view');
          });
        })
        .catch(error => {
          set(configuration, 'guiPluginConfig', oldConfig);
          globalNotify.backendError(this.t('savingConfiguration'), error);
        })
        .finally(() => {
          safeExec(this, () => {
            this.set('isSaving', false);
          });
        });
    },
    configurationChange({ value, isValid }) {
      this.updateEditorValue(value, isValid);
    },
  },
});
