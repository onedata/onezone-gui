import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['membership-element', 'membership-more'],

  /**
   * @override
   */
  i18nPrefix: 'components.membershipVisualiser.membershipMore',
});
