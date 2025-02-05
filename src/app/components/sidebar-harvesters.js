/**
 * A sidebar for harvesters.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import VirtualChunksListSidebar from 'onedata-gui-common/components/virtual-chunks-list-sidebar';

@classNames('sidebar-harvesters')
export default class SidebarHarvesters extends VirtualChunksListSidebar {
  /**
   * @override
   */
  i18nPrefix = 'components.sidebarHarvesters';

  /**
   * @override
   */
  model = null;

  /**
   * @override
   */
  sidebarType = 'harvesters';

  /**
   * @override
   */
  firstLevelItemComponent = 'sidebar-harvesters/harvester-item';

  /**
   * @override
   */
  get primaryItemHeight() {
    return 280;
  }

  /**
   * @override
   */
  @computed
  get secondLevelItems() {
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
  }
}
