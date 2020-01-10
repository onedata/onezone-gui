/**
 * A sidebar for shares (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-shares
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
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

  // FIXME: change to custom firstLevelItemComponent that shows file or dir icon
  /**
   * @override
   */
  firstLevelItemIcon: 'share',

  /**
   * @override
   */
  sidebarType: 'shares',

  // FIXME: debug
  init() {
    this._super(...arguments);
    window.sidebarShares = this;
  },
});
