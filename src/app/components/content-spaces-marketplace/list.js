/**
 * Spaces in marketplace list with search.
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/i18n';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import { and } from 'ember-awesome-macros';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import globalCssVariablesManager from 'onedata-gui-common/utils/global-css-variables-manager';
import { itemSpacing } from 'onezone-gui/components/content-spaces-marketplace';

/**
 * Height of single item in px.
 * @type {number}
 */
export const itemHeight = 310;

export const rowHeight = itemHeight + itemSpacing;

globalCssVariablesManager.setVariable(
  'components/content-spaces-marketplace/list',
  '--spaces-marketplace-item-height',
  `${itemHeight}px`,
);

export default Component.extend(I18n, {
  classNames: ['spaces-marketplace-list'],
  classNameBindings: ['isRefreshing:is-refreshing'],

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

  entries: reads('viewModel.entries'),

  entriesInitialLoad: reads('viewModel.entriesInitialLoad'),

  /**
   * @type {Array<SpaceTag>}
   */
  tags: reads('viewModel.tagsFilter'),

  showFetchPrevLoader: and(
    'entriesInitialLoad.isSettled',
    'infiniteScroll.fetchingStatus.isFetchingPrev'
  ),

  showFetchNextLoader: and(
    'entriesInitialLoad.isSettled',
    'infiniteScroll.fetchingStatus.isFetchingNext'
  ),

  renderRefreshSpinner: reads('viewModel.renderRefreshSpinner'),

  isRefreshing: reads('viewModel.isRefreshing'),

  init() {
    this._super(...arguments);
    this.initInfiniteScroll();
  },

  /**
   * @override
   */
  didInsertElement() {
    this._super(...arguments);
    this.infiniteScroll.mount(this.element.querySelector('.list-entries'));
    (async () => {
      await this.entriesInitialLoad;
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
      singleRowHeight: rowHeight,
    });
    this.set('infiniteScroll', infiniteScroll);
  },

  scrollToSelectedSpace() {
    if (!this.element) {
      return;
    }
    if (this.viewModel.selectedSpaceInfo?.consumeShouldScroll()) {
      /** @type {HTMLElement} */
      const itemElement = this.element.querySelector(
        `[data-row-id="${this.viewModel.selectedSpaceInfo.spaceId}"]`
      );
      if (!itemElement) {
        return;
      }
      const scrollOffset = itemElement.offsetTop;
      this.infiniteScroll.scrollHandler.scrollTo(null, scrollOffset);
    }
  },
});
