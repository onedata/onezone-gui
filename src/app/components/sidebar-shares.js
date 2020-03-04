/**
 * A sidebar for shares (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-shares
 * @author Jakub Liput
 * @copyright (C) 2019-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-shares'],

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  firstLevelItemIcon: 'share',

  /**
   * @override
   */
  sidebarType: 'shares',

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-shares/share-item',
});
