/**
 * A sidebar for providers (extension of ``one-sidebar``)
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2017-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import template from 'onedata-gui-common/templates/components/one-sidebar';
import I18n from 'onedata-gui-common/mixins/i18n';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { layout, classNames } from '@ember-decorators/component';
import { reads } from '@ember/object/computed';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

@layout(template)
@classNames('sidebar-spaces')
export default class extends OneSidebar.extend(I18n, UserProxyMixin) {
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
  @reads('model.collection.array') sortedCollection;

  /**
   * Disable filtering features.
   * @override
   */
  @reads('sortedCollection') filteredCollection;

  /**
   * @param {HTMLElement} element
   * @returns {Promise}
   */
  async mountInfiniteScroll(element) {
    await this.infiniteScroll.entries.initialLoad;
    await waitForRender();
    /** @type {HTMLElement} */
    const itemsTable = element.querySelector('.one-sidebar-primary-item-list');
    this.infiniteScroll.mount(itemsTable);
    // TODO: VFS-12506 Try to optimize numer of reloads (not needed on first init)
    this.chunksArray.scheduleReload();
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

  init() {
    super.init(...arguments);
    // FIXME: debug code
    ((name) => {
      window[name] = this;
      console.log(`window.${name}`, window[name]);
    })('debug_sidebar_spaces');
  }

  /**
   * @override
   */
  didInsertElement() {
    super.didInsertElement(...arguments);
    this.mountInfiniteScroll(this.element);
  }
}
