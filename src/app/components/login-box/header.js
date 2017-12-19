/**
 * A login-box header component specific for onezone
 *
 * @module components/login-box/header
 * @author Michal Borzecki
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Header from 'onedata-gui-common/components/login-box/header';
import layout from 'onezone-gui/templates/components/login-box/header';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

const I18N_PREFIX = 'components.loginBox.header';

export default Header.extend({
  layout,

  i18n: inject(),

  /**
   * @override
   */
  brandTitle: computed.reads('model.zoneName'),

  /**
   * @override
   */
  brandSubtitle: computed(function () {
    return this.get('i18n').t(I18N_PREFIX + '.isolatedZone');
  }),
});
