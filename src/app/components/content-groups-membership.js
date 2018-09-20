import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-groups-membership'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentGroupsMembership',
});
