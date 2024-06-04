/**
 * Welcome screen shown when there are no spaces in the Space Marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
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
      const action = this.spaceActions.createChooseSpaceToAdvertiseAction();
      (async () => {
        await action.execute();
        action.destroy();
      })();
    },
  },
});
