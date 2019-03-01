/**
 * A sidebar for harvesters (extension of `two-level-sidebar`)
 *
 * @module components/sidebar-harvesters
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import TwoLevelSidebar from 'onedata-gui-common/components/two-level-sidebar';
import layout from 'onedata-gui-common/templates/components/two-level-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default TwoLevelSidebar.extend(I18n, {
  layout,
  classNames: ['sidebar-harvesters'],

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarHarvesters',

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  firstLevelItemIcon: 'light-bulb',

  /**
   * @override
   */
  sidebarType: 'harvesters',

  /**
   * @override
   */
  showCreateOnEmpty: false,

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-harvesters/harvester-item',

  /**
   * @override
   */
  secondLevelItems: computed(function secondLevelItems() {
    return [{
      id: 'plugin',
      label: this.t('aspects.plugin'),
      icon: 'overview',
    }, {
      id: 'config',
      label: this.t('aspects.config'),
      icon: 'settings',
    }, {
      id: 'spaces',
      label: this.t('aspects.spaces'),
      icon: 'space',
    }, {
      id: 'members',
      label: this.t('aspects.members'),
      icon: 'group',
    }];
  }),
});
