/**
 * Using standard routes and configuration from onedata-gui-common addon
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataRouter from 'onedata-gui-common/utils/onedata-router';
import onedataRouterSetup from 'onedata-gui-common/utils/onedata-router-setup';

import config from './config/environment';

const Router = OnedataRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

// eslint-disable-next-line array-callback-return
Router.map(function () {
  this.route('provider-redirect', { path: 'provider-redirect/:provider_id' });
  this.route('test', function () {
    this.route('login');
  });
  onedataRouterSetup(Router, this, {
    public() {
      this.route('harvesters', { path: 'harvesters/:harvester_id' });
      this.route('shares', { path: 'shares/:share_id' });
      this.route('privacy-policy');
      this.route('terms-of-use');
    },
  });
});

export default Router;
