/**
 * A sidebar for groups (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-groups
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TwoLevelSidebar.extend(I18n, {
  layout,
  classNames: ['sidebar-clusters'],

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarClusters',

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  firstLevelItemIcon: 'menu-clusters',

  /**
   * @override
   */
  sidebarType: 'clusters',

  /**
   * @override
   */
  showCreateOnEmpty: false,

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-clusters/cluster-item',

  /**
   * @override
   */
  secondLevelItems: computed(function secondLevelItems() {
    return [];
  }),
});
