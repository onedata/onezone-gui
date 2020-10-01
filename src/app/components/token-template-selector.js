import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';
import { computed } from '@ember/object';

export default Component.extend(I18n, {
  classNames: ['token-template-selector', 'one-tile-container'],

  /**
   * @override
   */
  i18nPrefix: 'components.tokenTemplateSelector',

  /**
   * @type {Function}
   * @param {Object} tokenDefaults values for aspectOptions
   * @returns {String} url
   */
  generateTemplateUrl: notImplementedIgnore,

  /**
   * @type {ComputedProperty<String>}
   */
  onezoneRestTemplateLink: computed(
    'generateTemplateUrl',
    function onezoneRestTemplateLink() {
      return this.get('generateTemplateUrl')();
    }
  ),
});
