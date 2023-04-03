/**
 * A login-box header component specific for onezone.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Header from 'onedata-gui-common/components/login-box/header';
import layout from 'onezone-gui/templates/components/login-box/header';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Header.extend(I18n, {
  layout,

  i18n: inject(),
  onedataConnection: inject(),

  /**
   * @override
   */
  i18nPrefix: 'components.loginBox.header',

  /**
   * @override
   */
  brandTitle: computed('model.zoneName', function getBrandTitle() {
    return this.get('model.zoneName') || this.t('brandTitle');
  }),

  /**
   * @override
   */
  brandSubtitle: reads('onedataConnection.brandSubtitle'),
});
