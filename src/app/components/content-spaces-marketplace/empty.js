// FIXME: jsdoc

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['spaces-marketplace-empty'],

  spaceActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.empty',

  actions: {
    advertiseSpace() {
      this.spaceActions.createChooseSpaceToAdvertiseAction().execute();
    },
  },
});
