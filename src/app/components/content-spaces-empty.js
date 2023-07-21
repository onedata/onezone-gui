/**
 * A component with information about no spaces available
 *
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';

export default Component.extend(I18n, {
  classNames: ['content-spaces-empty'],

  spaceManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesEmpty',

  isMarketplaceInfoShown: reads('spaceManager.marketplaceConfig.enabled'),
});
