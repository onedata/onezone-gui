/**
 * A sidebar for user (extension of ``two-level-sidebar``)
 *
 * @module components/sidebar-users
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-users'],

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  firstLevelItemIcon: 'user',

  /**
   * @override
   */
  sidebarType: 'users',
});
