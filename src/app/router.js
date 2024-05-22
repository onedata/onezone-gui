/**
 * Using standard routes and configuration from onedata-gui-common addon
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OnedataRouter from 'onedata-gui-common/utils/onedata-router';
import onedataRouterSetup from 'onedata-gui-common/utils/onedata-router-setup';
import config from './config/environment';
import isCrossOriginIframe from 'onedata-gui-common/utils/is-cross-origin-iframe';

const Router = OnedataRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

/**
 * Should be bound to the router as a "public" method.
 */
function setupPublicRoutes() {
  this.route('harvesters', { path: 'harvesters/:harvester_id' });
  this.route('shares', { path: 'shares/:share_id' });
  this.route('privacy-policy');
  this.route('terms-of-use');
}

/**
 * Should be bound to the router as a "action" method.
 */
function setupActionRoutes() {
  this.route('file', { path: 'file/:file_action/:file_id' });
}

// eslint-disable-next-line array-callback-return
Router.map(function () {
  if (isCrossOriginIframe()) {
    this.route('public', function () {
      setupPublicRoutes.bind(this)();
    });
    this.route('action', function () {
      setupActionRoutes.bind(this)();
    });
  } else {
    this.route('provider-redirect', { path: 'provider-redirect/:provider_id' });
    this.route('test', function () {
      this.route('login');
    });
    onedataRouterSetup(Router, this, {
      public: setupPublicRoutes,
      action: setupActionRoutes,
    });
  }
});
