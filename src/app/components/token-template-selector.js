import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import notImplementedIgnore from 'onedata-gui-common/utils/not-implemented-ignore';

export default Component.extend(I18n, {
  classNames: ['token-template-selector', 'one-tile-container'],

  /**
   * @override
   */
  i18nPrefix: 'components.tokenTemplateSelector',

  /**
   * @virtual
   * @type {Function}
   * @param {String} templateName
   * @param {Object} template
   */
  onTemplateSelected: notImplementedIgnore,
});
