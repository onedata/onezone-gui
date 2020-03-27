/**
 * A sidebar for uploads (extension of `one-sidebar`)
 *
 * @module components/sidebar-uploads
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';

export default OneSidebar.extend({
  layout,

  classNames: ['sidebar-uploads'],

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
  firstLevelItemComponent: 'sidebar-uploads/upload-item',

  /**
   * @override
   */
  sidebarType: 'uploads',

  /**
   * @override
   */
  secondLevelItems: Object.freeze([]),

  /**
   * @override
   */
  showCreateOnEmpty: false,
});
