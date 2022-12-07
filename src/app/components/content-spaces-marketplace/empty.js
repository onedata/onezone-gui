// FIXME: jsdoc

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['spaces-marketplace-empty'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.empty',

  actions: {
    advertiseSpace() {

    },
  },
});
