/**
 * A login-box component specific for onezone.
 *
 * @module components/login-box
 * @author Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject } from '@ember/service';
import LoginBox from 'onedata-gui-common/components/login-box';

// TODO
// const I18N_PREFIX = 'components.loginBox.';

export default LoginBox.extend({
  i18n: inject(),
  onedataConnection: inject(),

  /**
   * @override
   */
  isLoaded: true,

  init() {
    this._super(...arguments);
    this.set(
      'headerModel.zoneName',
      this.get('onedataConnection.zoneName')
    );
  },
});
