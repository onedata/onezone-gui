/**
 * A sidebar for user (extension of ``one-sidebar``)
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';

export default OneSidebar.extend({
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
