/**
 * A sidebar for shares (extension of `one-sidebar`)
 *
 * @author Jakub Liput
 * @copyright (C) 2019-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import template from 'onedata-gui-common/templates/components/one-sidebar';
import { layout, classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import { inject as service } from '@ember/service';
import { reads } from '@ember/object/computed';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import ConflictIdsArray from 'onedata-gui-common/utils/conflict-ids-array';

// TODO: VFS-12506 Maybe create common class for sidebars with infinite scroll
@layout(template)
@classNames('sidebar-shares')
export default class SidebarShares extends OneSidebar {
  @service shareManager;

  /**
   * @override
   */
  model = null;

  /**
   * @override
   */
  isFilteringEnabled = false;

  /**
   * @override
   */
  firstLevelItemIcon = 'browser-share';

  /**
   * @override
   */
  sidebarType = 'shares';

  /**
   * @override
   */
  firstLevelItemComponent = 'sidebar-shares/share-item';

  // FIXME: poniższy region będzie reużywany?

  //#region infinite scroll sidebar

  // FIXME: space i group mają standardowo 50 px
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
  @computed('sortedCollection')
  get filteredCollection() {
    return ConflictIdsArray.create({
      content: this.sortedCollection,
      diffProperty: 'entityId',
      conflictProperty: 'name',
    });
  }

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
   * @override
   */
  didInsertElement() {
    super.didInsertElement(...arguments);
    this.mountInfiniteScroll(this.element);
  }
}
