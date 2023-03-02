/**
 * Spaces in marketplace list with search.
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import { and, sum } from 'ember-awesome-macros';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import globalCssVariablesManager from 'onedata-gui-common/utils/global-css-variables-manager';

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

  //#region config

  /**
   * Spacing between items in px.
   * @type {number}
   */
  itemSpacing: 20,

  itemSpacingVarName: '--spaces-marketplace-item-spacing',

  /**
   * Height of single item in px.
   * @type {number}
   */
  itemHeight: 300,

  itemHeightVarName: '--spaces-marketplace-item-height',

  //#endregion

  //#region state

  /**
   * @type {Utils.InfiniteScroll}
   */
  infiniteScroll: undefined,

  //#endregion

  rowHeight: sum('itemHeight', 'itemSpacing'),

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
    this.registerCssVariables();
    this.initInfiniteScroll();
  },

  registerCssVariables() {
    globalCssVariablesManager.setVariable(
      this,
      this.itemSpacingVarName,
      `${this.itemSpacing}px`,
    );
    globalCssVariablesManager.setVariable(
      this,
      this.itemHeightVarName,
      `${this.itemHeight}px`,
    );
  },

  deregisterCssVariables() {
    globalCssVariablesManager.unsetVariable(
      this,
      this.itemSpacingVarName,
    );
    globalCssVariablesManager.unsetVariable(
      this,
      this.itemHeightVarName,
    );
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
      await waitForRender();
      this.scrollToSelectedSpace();
    })();
  },

  /**
   * @override
   */
  willDestroyElement() {
    this._super(...arguments);
    this.deregisterCssVariables();
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
