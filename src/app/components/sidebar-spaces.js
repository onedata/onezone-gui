/**
 * A sidebar for spaces.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VirtualChunksListSidebar from 'onedata-gui-common/components/virtual-chunks-list-sidebar';
import template from 'onedata-gui-common/templates/components/one-sidebar';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { layout, classNames } from '@ember-decorators/component';

// FIXME: sprawdzić czy to layout jest potrzne (+sidebar-groups)
@layout(template)
@classNames('sidebar-spaces')
export default class extends VirtualChunksListSidebar.extend(UserProxyMixin) {
  /**
   * Note: `currentUser` service is needed by `UserProxyMixin`
   * which is needed by `space-item` to work.
   * @type {Ember.Service}
   */
  @service currentUser;
  @service navigationTabsConfiguration;

  /** @override */
  i18nPrefix = 'components.sidebarSpaces';

  /**
   * @override
   */
  model = null;

  /**
   * @override
   */
  firstLevelItemIcon = 'space';

  /**
   * @override
   */
  firstLevelItemComponent = 'sidebar-spaces/space-item';

  /**
   * @override
   */
  secondLevelItemsComponent = 'sidebar-spaces/second-level-items';

  /**
   * @override
   */
  sidebarType = 'spaces';

  /**
   * Number of items that can have MRU (most recently used) badge.
   * @type {ComputedProperty<number>}
   */
  @computed('sortedCollection.length')
  get maxMruCount() {
    const itemsCount = this.sortedCollection.length;
    return itemsCount > 1 ? Math.ceil(itemsCount / 5) : 0;
  }

  /**
   * List of MRU (most recently used) items IDs starting with MRU item.
   * @type {ComputedProperty<Array<string>>}
   */
  @computed(
    'sidebarType',
    'maxMruCount',
    'navigationTabsConfiguration.recentlyUsedWriteTimestamp',
  )
  get mruList() {
    return this.navigationTabsConfiguration.getRecentlyUsedResourceIds(
      this.sidebarType,
      this.maxMruCount
    );
  }

}
