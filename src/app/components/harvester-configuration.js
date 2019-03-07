import Component from '@ember/component';
import EmberObject, { computed, observer } from '@ember/object';
import { and, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['harvester-configuration'],

  i18n: service(),
  onedataConnection: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.harvesterConfiguration',

  /**
   * @virtual
   * @type {string}
   */
  mode: 'view',

  /**
   * @type {Model.Harvester}
   */
  harvester: null,

  /**
   * @type {Object}
   */
  guiPluginConfiguration: Object.freeze({}),

  /**
   * @type {boolean}
   */
  isGeneralSectionValid: false,

  /**
   * @type {boolean}
   */
  isTypesSectionValid: false,

  /**
   * @type {boolean}
   */
  isGuiPluginSectionValid: false,
  
  /**
   * @type {Ember.ComputedProperty<string>}
   */
  guiPluginPathPrefix: reads('onedataConnection.harvesterGuiPluginPathPrefix'),

  /**
   * @type {Ember.ComputedProperty<Object>}
   */
  changedData: computed(function changedData() {
    return {};
  }),

  // modeObserver: observer('mode', function modeObserver() {
  //   const {
  //     mode,
  //     guiPluginPathPrefix,
  //   } = this.getProperties('mode', 'guiPluginPathPrefix');
  //   if (mode === 'create') {
  //     this.set('harvester', EmberObject.create({
  //       guiPluginPath: guiPluginPathPrefix,
  //     }));
  //   }
  // }),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isValid: and(
    'isGeneralSectionValid',
    'isTypesSectionValid',
    'isGuiPluginSectionValid'
  ),

  actions: {
    onGeneralChange(values, isValid) {
      console.log(values, isValid);
      Object.assign(this.get('changedData'), values);
      this.set('isGeneralSectionValid', isValid);
    },
    onTypesChange(values, isValid) {
      console.log(values, isValid);
      Object.assign(this.get('changedData'), values);
      this.set('isTypesSectionValid', isValid);
    },
    onGuiPluginChange(values, isValid) {
      console.log(values, isValid);
      Object.assign(this.get('changedData'), values);
      this.set('isGuiPluginSectionValid', isValid);
    },
    onSave() {
      console.log(this.get('changedData'));
    },
  },
});
