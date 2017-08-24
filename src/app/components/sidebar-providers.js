/**
 * A sidebar for providers (extension of ``two-level-sidebar``)
 *
 * @module components/sidebar-providers
 * @author Jakub Liput
 * @copyright (C) 2017 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-providers'],

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  firstLevelItemIcon: 'menu-provider',

  /**
   * @override
   */
  triggerEventOnPrimaryItemSelection: false,

  /**
   * @override
   */
  sidebarType: 'providers',

});
