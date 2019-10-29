/**
 * A sidebar for tokens (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-tokens
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';

export default TwoLevelSidebar.extend({
  layout,

  classNames: ['sidebar-tokens'],

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-tokens/token-item',

  /**
   * @override
   */
  sidebarType: 'tokens',
});
