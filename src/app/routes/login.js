/**
 * When we reach this route and authRedirect flag is set, clear it, because
 * we reached login route which was intended.
 * 
 * @module routes/login
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Login from 'onedata-gui-common/routes/login';

export default Login.extend({
  afterModel() {
    const superResult = this._super(...arguments);
    sessionStorage.removeItem('authRedirect');
    return superResult;
  },
});
