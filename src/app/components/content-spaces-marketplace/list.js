/**
 * Spaces in marketplace list with search.
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import { and } from 'ember-awesome-macros';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';

export default Component.extend(I18n, {
  classNames: ['spaces-marketplace-list'],

  /**
   * @override
   */
  i18nPrefix: 'components.contentSpacesMarketplace.list',

  /**
   * @virtual
   * @type {Utils.SpacesMarketplaceViewModel}
   */
  viewModel: undefined,

  //#region state

  /**
   * @type {Utils.InfiniteScroll}
   */
  infiniteScroll: undefined,

  //#endregion

  // FIXME: synchronize with scss using the service (300 height + 20 margin-top)
  rowHeight: 320,

  // FIXME: review properties
  spaceItems: reads('viewModel.spaceItems'),

  entries: reads('viewModel.entries'),

  entriesInitialLoad: reads('viewModel.entriesInitialLoad'),

  selectedSpaceId: reads('viewModel.selectedSpaceId'),

  /**
   * @type {Array<SpaceTag>}
   */
  tags: reads('viewModel.tagsFilter'),

  // FIXME: to raczej powinno być w modelu
  entriesObserver: observer(
    'entries.@each.name',
    function entriesObserver() {
      if (this.entries) {
        addConflictLabels(this.entries, 'name', 'spaceId');
      }
    }
  ),

  showFetchPrevLoader: and(
    'entriesInitialLoad.isSettled',
    'infiniteScroll.fetchingStatus.isFetchingPrev'
  ),

  showFetchNextLoader: and(
    'entriesInitialLoad.isSettled',
    'infiniteScroll.fetchingStatus.isFetchingNext'
  ),

  init() {
    this._super(...arguments);
    this.initInfiniteScroll();
    this.entriesObserver();
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    this.infiniteScroll.mount(
      this.element.querySelector('.list-entries'),
      this.element.closest('.ps')
    );
    (async () => {
      await this.entriesInitialLoad;
      // FIXME: experimental wait for current task
      // await this.viewModel.entries.taskQueue.currentTask?.deferred.promise;
      await waitForRender();
      this.scrollToSelectedSpace();
    })();
  },

  initInfiniteScroll() {
    if (this.infiniteScroll) {
      throw new Error('inifiniteScroll is already initialized');
    }
    const infiniteScroll = InfiniteScroll.create({
      entries: this.entries,
      singleRowHeight: this.rowHeight,
    });
    this.set('infiniteScroll', infiniteScroll);
  },

  async scrollToSelectedSpace() {
    if (!this.selectedSpaceId || !this.element) {
      return;
    }
    /** @type {HTMLElement} */
    const itemElement = this.element.querySelector(
      `[data-row-id="${this.selectedSpaceId}"]`
    );
    if (!itemElement) {
      return;
    }
    const scrollOffset = itemElement.offsetTop -
      window.parseInt(window.getComputedStyle(itemElement).marginTop) -
      this.viewModel.getStickyHeaderHeight();
    this.infiniteScroll.scrollHandler.scrollTo(null, scrollOffset);
  },
});
