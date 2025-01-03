/**
 * A sidebar for spaces.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import template from 'onedata-gui-common/templates/components/one-sidebar';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { layout, classNames } from '@ember-decorators/component';
import { reads } from '@ember/object/computed';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import { debounce } from '@ember/runloop';

@layout(template)
@classNames('sidebar-spaces')
export default class extends OneSidebar.extend(UserProxyMixin) {
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

  //#region infinite scroll sidebar

  isInfiniteScroll = true;

  rowHeight = 54;

  @reads('model.collection.chunksArray') chunksArray;

  @computed('chunksArray')
  get infiniteScroll() {
    return InfiniteScroll.create({
      entries: this.chunksArray,
      singleRowHeight: this.rowHeight,
      itemIdProperty: 'entityId',
    });
  }

  /**
   * @override
   */
  @reads('model.collection.fullArray') sortedCollection;

  /**
   * Disable filtering features.
   * @override
   */
  @reads('model.collection.array') filteredCollection;

  /**
   * @param {HTMLElement} element
   * @returns {Promise}
   */
  async mountInfiniteScroll(element) {
    const chunksArray = this.infiniteScroll.entries;
    await chunksArray.initialLoad;
    await waitForRender();
    /** @type {HTMLElement} */
    const itemsTable = element.querySelector('.one-sidebar-primary-item-list');
    this.infiniteScroll.mount(itemsTable);
    const virtualListReloader =
      this.model.collection.virtualListChunksArray.virtualListReloader;
    virtualListReloader.onListChanged = async () => {
      // FIXME: próba optymalizacji: jeśli po renderze aktywny item nie jest na widocznej liście
      if (this.primaryItem) {
        this.handlePrimaryItemChange();
      }
    };
  }

  /**
   * @override
   */
  didInsertElement() {
    super.didInsertElement(...arguments);
    this.mountInfiniteScroll(this.element);
  }

  /**
   * @override
   */
  willDestroy() {
    super.willDestroy(...arguments);
    this.infiniteScroll?.destroy();
  }

  /**
   * @override
   */
  async handlePrimaryItemChange() {
    if (!this.primaryItem) {
      return;
    }
    // scrollSidebarToActiveItem does the array jump internally
    await this.scrollSidebarToActiveItem();
    await waitForRender();
    if (this.isDestroyed || this.isDestroying) {
      return;
    }
    // After jump, the list has no front loaded, executing scroll handler causes
    // the InfiniteScroll toolkit to trigger fetch prev.
    this.infiniteScroll.scrollHandler.listWatcher.scrollHandler();
  }

  //#endregion

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
   * @type {ComputedProperty<number>}
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

  /**
   * @override
   * @param {string} expression
   */
  setFilter(expression) {
    super.setFilter(expression);
    debounce(this, 'setVirtualListFilter', 500);
  }

  setVirtualListFilter() {
    this.model.collection.setFilter(this.filter);
  }
}
