/**
 * A login-box header component specific for onezone.
 *
 * @module components/login-box/header
 * @author Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Header from 'onedata-gui-common/components/login-box/header';
import layout from 'onezone-gui/templates/components/login-box/header';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

const I18N_PREFIX = 'components.loginBox.header';

export default Header.extend(I18n, {
  layout,

  i18n: inject(),

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
  brandSubtitle: computed(function () {
    return this.get('i18n').t(I18N_PREFIX + '.isolatedZone');
  }),
});
