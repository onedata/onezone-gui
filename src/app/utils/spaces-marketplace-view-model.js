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
import sleep from 'onedata-gui-common/utils/sleep';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import waitForRender from 'onedata-gui-common/utils/wait-for-render';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import { debounce } from '@ember/runloop';
import globalCssVariablesManager from 'onedata-gui-common/utils/global-css-variables-manager';

/**
 * Time in ms.
 * @type {number}
 */
export const refreshTransitionDuration = 80;

globalCssVariablesManager.setVariable(
  'utils/spaces-marketplace-view-model',
  '--spaces-marketplace-refresh-transition-duration',
  `${refreshTransitionDuration}ms`,
);

export default EmberObject.extend(OwnerInjector, {
  spaceManager: service(),
  currentUser: service(),
  globalNotify: service(),

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
   * If true, a refresh spinner should be rendered.
   * It is separate property from `isRefreshing`, because refresh spinner
   * should be inserted before changing `isRefreshing` - when the spinner
   * is inserted and the view is currently not refreshing, then it is not visible,
   * because of zero opacity.
   * Note, that spinner could be reneder all the time, but it is visible only
   * when refresh is active. This property is used to remove the spinner if it is
   * unnecessary (for all the time user is browsing marketplace).
   * @type {boolean}
   */
  renderRefreshSpinner: false,

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

  marketplaceConfig: reads('spaceManager.marketplaceConfig'),

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

  /**
   * @type {ComputedProperty<PromiseObject<SelectedSpaceInfo>>>}
   */
  selectedSpaceInfoProxy: promise.object(computed(
    'selectedSpaceId',
    async function selectedSpaceInfoProxy() {
      if (this.selectedSpaceId) {
        try {
          const record = await this.spaceManager.getSpaceMarketplaceInfo(
            this.selectedSpaceId
          );
          return new SelectedSpaceInfo(record);
        } catch (error) {
          return new SelectedSpaceInfo(null, error);
        }
      } else {
        return new SelectedSpaceInfo();
      }
    }
  )),

  /**
   * @type {ComputedProperty<PromiseObject<Models.SpaceMembershipRequestsInfo>>}
   */
  spaceMembershipRequestsInfoProxy: promise.object(computed(
    function spaceMembershipRequestsInfoProxy() {
      return this.spaceManager.getSpaceMembershipRequestsInfo();
    }
  )),

  selectedSpaceInfo: reads('selectedSpaceInfoProxy.content'),

  spaceMembershipRequestsInfo: reads('spaceMembershipRequestsInfoProxy.content'),

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

  entriesConflictNamesSetter: observer(
    'entries.@each.name',
    function entriesConflictNamesSetter() {
      debounce(this, 'setConflictNames', 100);
    }
  ),

  init() {
    this._super(...arguments);
    // infinite loading before entries array is initialized async
    this.set('entriesInitialLoad', promiseObject(new Promise(() => {})));
    this.initEntries();
  },

  async initEntries() {
    const selectedSpaceInfo = await this.selectedSpaceInfoProxy;
    const initialJumpIndex = selectedSpaceInfo?.index ?? null;
    const entries = ReplacingChunksArray.create({
      fetch: this.fetchFilteredEntries.bind(this),
      startIndex: 0,
      endIndex: 12,
      indexMargin: 6,
      chunkSize: 12,
      initialJumpIndex,
    });
    this.set('entries', entries);
    defineProperty(this, 'entriesInitialLoad', reads('entries.initialLoad'));
    // needed after defineProperty
    this.notifyPropertyChange('entriesInitialLoad');
  },

  setConflictNames() {
    const loadedEntries = this.entries.filter(entry => entry?.id);
    if (!_.isEmpty(loadedEntries)) {
      addConflictLabels(loadedEntries, 'name', 'spaceId');
    }
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
    this.refreshList({ head: true });
  },

  /**
   * @public
   * @param {Array<SpaceTag>} tags
   */
  changeTagsFilter(tags) {
    this.set('tagsFilter', _.isEmpty(tags) ? null : tags);
    this.refreshList({ head: true });
  },

  /**
   * @public
   */
  async refreshList({ head = false } = {}) {
    if (this.isRefreshing) {
      return;
    }
    this.set('renderRefreshSpinner', true);
    // spinner should be rendered before changing fade-in class
    await waitForRender();
    this.set('isRefreshing', true);
    await sleep(refreshTransitionDuration);
    try {
      await this.entries.scheduleReload({ head });
    } finally {
      safeExec(this, 'setProperties', {
        renderRefreshSpinner: false,
        isRefreshing: false,
      });
    }
  },
});

/**
 * When fetch with filtering is performed, it is possible that user changes filtering
 * options. A fetch function for ReplacingChunksArray is done one time for listing spaces
 * that should be filtered using these user-defined filters. This class manages repeated
 * fetches to fulfill filter requirements, because the virtual filtered fetch could need
 * multiple SpaceManager fetches and in single fetch call it may be required to start
 * listing from beginning.
 */
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
    while (this.finalArray.length < this.initialLimit && !this.finalIsLast) {
      /** @type {{ array: Array, isLast: boolean }} */
      const result = await this.fetchEntries({
        index: this.currentIndex,
        limit: this.initialLimit,
        offset: this.currentOffset,
        tags: this.tags,
      });
      if (this.isCurrentFilterEqualViewFilter()) {
        const entriesMatchingToAdd = filterSpaces(result.array, this.searchValue)
          .slice(0, this.initialLimit - this.finalArray.length);
        this.finalArray.push(...entriesMatchingToAdd);
        this.currentIndex = _.last(result.array)?.index ?? null;
        if (this.currentIndex === null) {
          break;
        }
        this.currentOffset = 1;
        this.finalIsLast = result.isLast;
      } else {
        this.reinitializeState();
      }
    }
    return {
      array: this.finalArray,
      isLast: this.finalIsLast,
    };
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

/**
 * The view supports focusing selected space in the marketplace (eg. via URL). Instance of
 * this class is an encapsulated state of the selection actions, which is distributed
 * among various components.
 */
class SelectedSpaceInfo {
  constructor(record = null, error = null) {
    this.record = record;
    this.error = error;
    const isActivated = Boolean(this.record && !this.error);
    this.shouldScroll = isActivated;
    this.shouldBlink = isActivated;
  }
  get spaceId() {
    return this.record && get(this.record, 'entityId');
  }
  get index() {
    return this.record && get(this.record, 'index');
  }
  consumeShouldBlink(consumerSpaceId) {
    if (
      this.shouldBlink &&
      this.spaceId === consumerSpaceId
    ) {
      this.shouldBlink = false;
      return true;
    } else {
      return false;
    }
  }
  consumeShouldScroll() {
    if (
      this.shouldScroll &&
      this.spaceId
    ) {
      this.shouldScroll = false;
      return true;
    } else {
      return false;
    }
  }
}
