/**
 * A sidebar for automation inventories (extension of `one-sidebar`)
 *
 * @module components/sidebar-atm-inventories
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default OneSidebar.extend(I18n, {
  layout,
  classNames: ['sidebar-atm-inventories'],

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarAtmInventories',

  /**
   * @override
   */
  model: null,

  /**
   * @override
   */
  sidebarType: 'atm-inventories',

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-atm-inventories/atm-inventory-item',

  /**
   * @override
   */
  secondLevelItems: computed(function secondLevelItems() {
    return [{
      id: 'workflows',
      label: this.t('aspects.workflows'),
      icon: 'lambda',
    }, {
      id: 'lambdas',
      label: this.t('aspects.lambdas'),
      icon: 'lambda',
    }, {
      id: 'members',
      label: this.t('aspects.members'),
      icon: 'group',
    }];
  }),
});
