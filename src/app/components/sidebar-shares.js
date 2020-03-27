/**
 * A sidebar for shares (extension of `one-sidebar`)
 *
 * @module components/sidebar-shares
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';

export default OneSidebar.extend({
  layout,

  classNames: ['sidebar-shares'],

  /**
   * @override
   */
  model: null,

  // FIXME: change to custom firstLevelItemComponent that shows file or dir icon
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
