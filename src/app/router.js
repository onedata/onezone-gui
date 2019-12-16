/**
 * Using standard routes and configuration from onedata-gui-common addon
 * @module router
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberRouter from '@ember/routing/router';
import onedataRouterSetup from 'onedata-gui-common/utils/onedata-router-setup';

import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function () {
  this.route('provider-redirect', { path: 'provider-redirect/:provider_id' });
  this.route('test', function () {
    this.route('login');
  });
  onedataRouterSetup(Router, this, {
    public() {
      this.route('harvesters', { path: 'harvesters/:harvester_id' });
    },
  });
});

export default Router;
