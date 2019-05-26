/**
 * Controller for global provider redirection route.
 * Implemented just for reading query params.
 *
 * @module controllers/onedata/provider-redirect
 * @author Jakub Liput
 * @copyright (C) 2018-2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Controller from '@ember/controller';
import { reads } from '@ember/object/computed';

export default Controller.extend({
  queryParams: ['space_id', 'resource_type'],

  /**
   * If query param provided, the underlying component will redirect
   * to specific space in specific provider GUI.
   * @type {ComputedProperty<string>}
   */
  spaceId: reads('space_id'),

  /**
   * Optional name of main menu item in Oneprovider, eg. data, shares, transfers
   * @type {ComputedProperty<string>}
   */
  resourceType: reads('resource_type'),
});
