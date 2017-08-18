/**
 * Using standard routes and configuration from onedata-gui-common addon
 * @module router
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Ember from 'ember';
import onedataRouterSetup from 'onedata-gui-common/utils/onedata-router-setup';

import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL,
});

Router.map(function () {
  onedataRouterSetup(Router, this);
});

export default Router;
