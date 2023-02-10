/**
 * Spaces in marketplace list with search.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { observer } from '@ember/object';
import { reads } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import InfiniteScroll from 'onedata-gui-common/utils/infinite-scroll';
import { and } from 'ember-awesome-macros';

const typingActionDebouce = config.timing.typingActionDebouce;

export default Component.extend(I18n, {
  classNames: ['spaces-marketplace-list'],

  navigationState: service(),

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

  urlSelectedSpace: reads('navigationState.aspectOptions.selectedSpace'),

  entries: reads('viewModel.entries'),

  /**
   * @type {Array<SpaceTag>}
   */
  tags: reads('viewModel.tagsFilter'),

  collectionObserver: observer(
    'entries.@each.name',
    function collectionObserver() {
      addConflictLabels(this.entries, 'name', 'spaceId');
    }
  ),

  showFetchPrevLoader: and(
    'entries.initialLoad.isSettled',
    'infiniteScroll.fetchingStatus.isFetchingPrev'
  ),

  showFetchNextLoader: and(
    'entries.initialLoad.isSettled',
    'infiniteScroll.fetchingStatus.isFetchingNext'
  ),

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
    // FIXME: implement jump
    // this.scrollToSelectedSpace();
  },

  initInfiniteScroll() {
    window.entries = this.entries;
    // FIXME: maybe registering adjustScrollAfterBeginningChange is needed (ifinite-scroll-table)
    const infiniteScroll = InfiniteScroll.create({
      entries: this.entries,
      singleRowHeight: this.rowHeight,
    });
    this.set('infiniteScroll', infiniteScroll);
  },

  // FIXME: reimplement
  scrollToSelectedSpace() {
    if (!this.urlSelectedSpace || !this.element) {
      return;
    }
    /** @type {HTMLElement} */
    const itemElement = this.element.querySelector(`[data-row-id="${this.urlSelectedSpace}"]`);
    if (!itemElement) {
      return;
    }
    itemElement.scrollIntoView();
  },

  actions: {
    changeSearchValue(newValue) {
      debounce(this.viewModel, 'changeSearchValue', newValue, typingActionDebouce);
    },
    changeTagsFilter(tags) {
      this.viewModel.changeTagsFilter(tags);
    },
  },
});
