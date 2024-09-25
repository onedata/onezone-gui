/**
 * A login-box component specific for onezone.
 *
 * @author Michał Borzęcki
 * @author Jakub Liput
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import LoginBox from 'onedata-gui-common/components/login-box';

export default LoginBox.extend({
  i18n: service(),
  onedataConnection: service(),
  cookies: service(),

  /**
   * @override
   */
  isLoaded: true,

  /**
   * @override
   * Set in init when the special cookie is set
   */
  sessionHasExpired: false,

  init() {
    this._super(...arguments);
    this.set(
      'headerModel.zoneName',
      this.get('onedataConnection.zoneName')
    );
  },
});
