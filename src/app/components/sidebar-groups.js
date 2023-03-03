/**
 * A sidebar for groups (extension of `one-sidebar`)
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default OneSidebar.extend(I18n, {
  layout,
  classNames: ['sidebar-groups'],

  /**
   * @override
   */
  i18nPrefix: 'components.sidebarGroups',

  /**
   * @override
   */
  model: null,

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
  firstLevelItemComponent: 'sidebar-groups/group-item',

  /**
   * @override
   */
  secondLevelItems: computed(function secondLevelItems() {
    // TODO uncomment overview
    return [{
      //   id: 'index',
      //   label: this.t('aspects.index'),
      //   icon: 'overview',
      // }, {
      id: 'members',
      label: this.t('aspects.members'),
      icon: 'group',
    }, {
      id: 'hierarchy',
      label: this.t('aspects.hierarchy'),
      icon: 'hierarchy',
    }];
  }),
});
