/**
 * A sidebar for harvesters (extension of `one-sidebar`)
 *
 * @module components/sidebar-harvesters
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default OneSidebar.extend(I18n, {
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
  sidebarType: 'harvesters',

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
      id: 'spaces',
      label: this.t('aspects.spaces'),
      icon: 'space',
    }, {
      id: 'indices',
      label: this.t('aspects.indices'),
      icon: 'index',
    }, {
      id: 'members',
      label: this.t('aspects.members'),
      icon: 'group',
    }, {
      id: 'config',
      label: this.t('aspects.config'),
      icon: 'settings',
    }];
  }),
});
