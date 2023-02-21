/**
 * View model for space marketplace components.
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get, defineProperty, observer } from '@ember/object';
import { reads, notEmpty } from '@ember/object/computed';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { isEmpty, promise, or, eq, raw } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import SpacesMarketplaceItem from 'onezone-gui/utils/spaces-marketplace-item';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import filterSpaces from 'onezone-gui/utils/filter-spaces';
import _ from 'lodash';
import { Promise } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';

export default EmberObject.extend(OwnerInjector, {
  spaceManager: service(),
  currentUser: service(),

  /**
   * @virtual optional
   * @type {string|null}
   */
  selectedSpaceId: null,

  //#region state

  /**
   * @type {string}
   */
  searchValue: '',

  /**
   * @type {Array<SpaceTag>|null}
   */
  tagsFilter: null,

  /**
   * @type {Array<Utils.SpacesMarketplaceItem>}
   */
  entries: undefined,

  /**
   * @type {Promise}
   */
  entriesInitialLoad: undefined,

  /**
   * Current state of refreshing process invoked by user.
   * @type {boolean}
   */
  isRefreshing: false,

  /**
   * Main view state - it starts from `initialLoading`, when entries list is loaded for
   * the first time. Then if there are no spaces in the marketplace at all,
   * the state is transitioned to `noSpacesAvailable` showing welcome empty-marketplace
   * screen. If at least one space is detected then state is transitioned to final `list`
   * where list is rendered. List could be also empty (when filters are on or off), but
   * when the component is initialized, there will be no more welcome screen.
   * The state could be also transitioned directly from `initialLoading` to `list`
   * if there are some spaces after initial load.
   * @type {'initialLoading'|'noSpacesAvailable'|'list'}
   */
  viewState: 'initialLoading',

  //#endregion

  /**
   * True, if the current list considering search conditions, is empty.
   * @type {ComputedProperty<boolean>}
   */
  isCurrentListEmpty: isEmpty('entries'),

  showEmptyListView: eq('viewState', raw('noSpacesAvailable')),

  isAnyFilterActive: or(
    'searchValue',
    notEmpty('tagsFilter'),
  ),

  userSpacesIdsProxy: promise.object(computed(
    'currentUser.user.spaceList.content.list',
    async function userSpacesIds() {
      const currentUserRecord = await this.currentUser.userProxy;
      const spaceList = await get(currentUserRecord, 'spaceList');
      return spaceList.hasMany('list').ids().map(spaceGri => parseGri(spaceGri).entityId);
    }
  )),

  selectedSpaceMarketplaceInfoProxy: promise.object(computed(
    'selectedSpaceId',
    async function selectedSpaceMarketplaceInfoProxy() {
      if (!this.selectedSpaceId) {
        return null;
      }
      return this.spaceManager.getSpaceMarketplaceInfo(this.selectedSpaceId);
    }
  )),

  viewStateChanger: observer('entriesInitialLoad.isSettled', 'entries.length', function viewStateChanger() {
    const state = this.viewState;
    switch (state) {
      case 'initialLoading':
        if (this.entriesInitialLoad.isSettled) {
          if (!this.entries.length && !this.isAnyFilterActive) {
            this.set('viewState', 'noSpacesAvailable');
          } else {
            this.set('viewState', 'list');
          }
        }
        break;
      case 'noSpacesAvailable':
        if (this.entries.length && !this.isAnyFilterActive) {
          this.set('viewState', 'list');
        }
        break;
      case 'list':
      default:
        // Final state - if spaces list become empty, show small information about
        // no spaces available on list. It could be problematic if we hide filter
        break;
    }
  }),

  init() {
    this._super(...arguments);
    // infinite loading before entries array is initialized async
    this.set('entriesInitialLoad', promiseObject(new Promise(() => {})));
    this.initEntries();

    // FIXME: debug code
    window.viewModel = this;
  },

  async initEntries() {
    const selectedSpaceMarketplaceInfo = await this.selectedSpaceMarketplaceInfoProxy;
    const initialJumpIndex = selectedSpaceMarketplaceInfo &&
      get(selectedSpaceMarketplaceInfo, 'index') || null;
    const entries = ReplacingChunksArray.create({
      fetch: this.fetchFilteredEntries.bind(this),
      startIndex: 0,
      endIndex: 10,
      indexMargin: 5,
      initialJumpIndex,
    });
    this.set('entries', entries);
    defineProperty(this, 'entriesInitialLoad', reads('entries.initialLoad'));
    // needed after defineProperty
    this.notifyPropertyChange('entriesInitialLoad');
  },

  /**
   * Fetches next chunks of space marketplace items until an array of requested length
   * (`limit`) is made, containing space items that are conforming current search string
   * (`this.searchValue`) and tags filter (`this.tagsFilter`).
   * @returns {{ array: Array<Utils.SpacesMarketplaceItem>, isLast: boolean }}
   */
  async fetchFilteredEntries(index, limit, offset) {
    const fetcher = new FilteredEntriesFetcher(this, { index, limit, offset });
    return fetcher.performFetch();
  },

  /**
   * @returns {{ array: Array<Utils.SpacesMarketplaceItem>, isLast: boolean }}
   */
  async fetchEntries({ index, limit, offset, tags }) {
    const viewModel = this;
    const listingParams = {
      index,
      limit,
      offset,
    };
    const {
      array: recordsArray,
      isLast,
    } = await this.spaceManager.fetchSpacesMarkeplaceInfoRecords(
      listingParams,
      tags
    );
    const resultArray = recordsArray.map(spaceMarketplaceInfo =>
      SpacesMarketplaceItem.create({
        spaceMarketplaceInfo,
        viewModel,
      })
    );
    return {
      array: resultArray,
      isLast,
    };
  },

  /**
   * @public
   * @param {string} value
   */
  changeSearchValue(value) {
    this.set('searchValue', value);
    // FIXME: debug
    console.log('DEBUG: changeSearchValue', value, 'will scheduleReload');
    this.entries.scheduleReload({ head: true });
  },

  /**
   * @public
   * @param {Array<SpaceTag>} tags
   */
  changeTagsFilter(tags) {
    this.set('tagsFilter', _.isEmpty(tags) ? null : tags);
    this.entries.scheduleReload({ head: true });
  },

  /**
   * @public
   */
  async refreshList() {
    if (this.isRefreshing) {
      return;
    }
    this.set('isRefreshing', true);
    try {
      await this.entries.scheduleReload();
    } finally {
      this.set('isRefreshing', false);
    }

  },
});

// FIXME: more jsdoc about this class; names of methods
class FilteredEntriesFetcher {
  /**
   * @param {Utils.SpacesMarketplaceViewModel} viewModel
   * @param {{ index: string, limit: number, offset: number }} fetchParams
   */
  constructor(viewModel, { index, limit, offset }) {
    /** @type {Utils.SpacesMarketplaceViewModel} */
    this.viewModel = viewModel;

    /** @type {string} */
    this.initialIndex = index;

    /** @type {number} */
    this.initialLimit = limit;

    /** @type {number} */
    this.initialOffset = offset;

    this.reinitializeState();
  }

  async performFetch() {
    while (this.currentLimit > 0 && !this.finalIsLast) {
      /** @type {{ array: Array, isLast: boolean }} */
      const result = await this.fetchEntries({
        index: this.currentIndex,
        limit: this.currentLimit,
        offset: this.currentOffset,
        tags: this.tags,
      });
      if (this.isCurrentFilterEqualViewFilter()) {
        const entriesMatchingToAdd = filterSpaces(result.array, this.searchValue)
          .slice(0, this.initialLimit - this.finalArray.length);
        this.finalArray.push(...entriesMatchingToAdd);
        this.currentIndex = result.array.at(-1)?.index ?? null;
        if (this.currentIndex === null) {
          break;
        }
        this.currentOffset = 1;
        this.currentLimit = Math.min(
          this.initialLimit,
          this.initialLimit - this.finalArray.length
        );
        this.finalIsLast = result.isLast;
        return {
          array: this.finalArray,
          isLast: this.finalIsLast,
        };
      } else {
        this.reinitializeState();
      }
    }
  }

  isCurrentFilterEqualViewFilter() {
    return this.searchValue === this.viewSearchValue &&
      _.isEqual(this.tags, this.viewTags);
  }

  reinitializeState() {
    /** @type {boolean} */
    this.finalIsLast = false;

    /** @type {string} */
    this.currentIndex = this.initialIndex;

    /** @type {number} */
    this.currentOffset = this.initialOffset;

    /** @type {number} */
    this.currentLimit = this.initialLimit;

    /** @type {Array} */
    this.finalArray = [];

    /** @type {string} */
    this.searchValue = this.viewSearchValue;

    /** @type {Array<string>} */
    this.tags = this.viewTags;
  }

  async fetchEntries() {
    return this.viewModel.fetchEntries(...arguments);
  }

  get viewSearchValue() {
    return this.viewModel.searchValue;
  }

  get viewTags() {
    return this.viewModel.tagsFilter ?
      this.viewModel.tagsFilter.map(({ label }) => label) : undefined;
  }
}
