import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

// FIXME: change image in content-info
export default Component.extend(I18n, {
  classNames: ['content-tokens-new'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentTokensNew',
});
