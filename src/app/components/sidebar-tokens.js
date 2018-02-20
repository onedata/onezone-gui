/**
 * A sidebar for tokens (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-tokens
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import { A } from '@ember/array';
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
   * Keep original sorting from server, but make a copy of array
   */
  sortedCollection: computed('model.collection.[]', function () {
    return A(this.get('model.collection').toArray());
  }),

  /**
   * @override
   */
  firstLevelItemIcon: 'tokens',

  /**
   * @override
   */
  triggerEventOnPrimaryItemSelection: true,

  /**
   * @override
   */
  sidebarType: 'tokens',

  /**
   * @override
   */
  secondLevelItems: Object.freeze([]),

  /**
   * @override
   */
  showCreateOnEmpty: false,
});
