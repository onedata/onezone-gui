/**
 * A sidebar for groups (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-groups
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

  classNames: ['sidebar-groups'],

  /**
   * @override
   */
  model: null,

  /**
   * @override
   * Keep original sorting from server, but make a copy of array
   */
  sortedCollection: computed('model.collection.list.[]', function () {
    return A(this.get('model.collection.list').toArray());
  }),

  /**
   * @override
   */
  firstLevelItemIcon: 'group',

  /**
   * @override
   */
  sidebarType: 'groups',

  /**
   * @override
   */
  secondLevelItems: Object.freeze([]),

  /**
   * @override
   */
  showCreateOnEmpty: false,
});
