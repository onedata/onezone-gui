/**
 * A sidebar for data providers (extension of ``one-sidebar``)
 *
 * @module components/sidebar-providers
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';

export default OneSidebar.extend({
  layout,

  classNames: ['sidebar-providers'],

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  firstLevelItemIcon: 'provider',

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-providers/provider-item',

  /**
   * @override
   */
  sidebarType: 'providers',
});
