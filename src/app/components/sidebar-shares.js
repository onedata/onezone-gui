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

  isInfiniteScroll = true;

  rowHeight = 54;

  @reads('model.collection.chunksArray') chunksArray;

  @computed('chunksArray')
  get infiniteScroll() {
    return InfiniteScroll.create({
      entries: this.chunksArray,
      singleRowHeight: this.rowHeight,
      // FIXME: implement, może auto refresh
      // onScroll: this.handleTableScroll.bind(this),
    });
  }

  // FIXME: wyciągnąć obsługę infinite scroll do wspólnej klasy dla sidebarów?

  // FIXME: ignorujemy model sidebarowy - pewnie przenieść RCA do sidebara
  // FIXME: nadpisywanie sortedCollection i filteredCollection powinno być robione już na
  // etapie klasy sidebara wyżej (generycznie dla kolekcji infinite)
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
   * @override
   */
  init() {
    super.init(...arguments);

    // FIXME: debug code
    ((name) => {
      window[name] = this;
      console.log(`window.${name}`, window[name]);
    })('debug_sidebar_shares');
  }

  /**
   * @override
   */
  didInsertElement() {
    super.didInsertElement(...arguments);

    (async () => {
      await this.infiniteScroll.entries.initialLoad;
      await waitForRender();
      /** @type {HTMLElement} */
      const itemsTable = this.element.querySelector('.one-sidebar-primary-item-list');
      this.infiniteScroll.mount(itemsTable);
    })();
  }
}
