import TabBase from 'onezone-gui/components/content-spaces-support/-tab-base';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TabBase.extend(I18n, {
  classNames: ['request-support-tab'],
  i18nPrefix: 'components.contentSpacesSupport.requestSupport',
});
