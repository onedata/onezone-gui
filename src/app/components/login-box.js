/**
 * A login-box component specific for onezone.
 *
 * @module components/login-box
 * @author Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import LoginBox from 'onedata-gui-common/components/login-box';
import AuthenticationErrorMessage from 'onedata-gui-common/mixins/authentication-error-message';
import { sessionExpiredCookie } from 'onezone-gui/components/websocket-reconnection-modal';

export default LoginBox.extend(AuthenticationErrorMessage, {
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
    const cookies = this.get('cookies');
    this.set(
      'headerModel.zoneName',
      this.get('onedataConnection.zoneName')
    );
    if (cookies.read(sessionExpiredCookie)) {
      this.set('sessionHasExpired', true);
      cookies.clear(sessionExpiredCookie, { path: '/' });
    }
  },
});
