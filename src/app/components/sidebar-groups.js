/**
 * A sidebar for groups.
 *
 * @author Michał Borzęcki, Jakub Liput
 * @copyright (C) 2018-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { computed } from '@ember/object';
import ChunkableListModelSidebar from 'onedata-gui-common/components/chunkable-list-model-sidebar';
import { classNames } from '@ember-decorators/component';

@classNames('sidebar-groups')
export default class SidebarGroups extends ChunkableListModelSidebar {
  /**
   * @override
   */
  i18nPrefix = 'components.sidebarGroups';

  /**
   * @override
   */
  model = null;

  /**
   * @override
   */
  firstLevelItemIcon = 'group';

  /**
   * @override
   */
  sidebarType = 'groups';

  /**
   * @override
   */
  firstLevelItemComponent = 'sidebar-groups/group-item';

  /**
   * @override
   */
  get primaryItemHeight() {
    return 142;
  }

  /**
   * @override
   */
  @computed()
  get secondLevelItems() {
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
  }
}
