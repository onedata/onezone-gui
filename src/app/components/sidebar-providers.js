/**
 * A sidebar for providers (extension of ``two-level-sidebar``)
 *
 * @module components/sidebar-providers
 * @author Jakub Liput, Michal Borzecki
 * @copyright (C) 2017-2018 ACK CYFRONET AGH
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
  firstLevelItemIcon: 'provider',

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-providers/provider-item',

  /**
   * @override
   */
  triggerEventOnPrimaryItemSelection: true,

  /**
   * @override
   */
  sidebarType: 'providers',
});
