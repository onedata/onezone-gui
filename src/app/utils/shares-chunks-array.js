/**
 * Chunks array fetching merged shares from all spaces.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import MergedChunksArray from 'onedata-gui-common/utils/merged-chunks-array';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { inject as service } from '@ember/service';
import { SharesSidebarItem } from 'onezone-gui/utils/shares-sidebar-item';
import { all as allFulfilled, allSettled } from 'rsvp';
import { mergeResults } from 'onedata-gui-common/utils/merged-chunks-array';
import _ from 'lodash';

export default class SharesChunksArray extends MergedChunksArray.extend(OwnerInjector) {
  @service currentUser;
  @service shareManager;
  @service spaceManager;

  /**
   * How many spaces will be queried for share list in single batch.
   * @type {number}
   */
  spacesBatchSize = 10;

  /** @type {boolean} */
  isPrepareFetchersPending = false;

  /** @type {Map<ShareListMultiFetcher, ShareListMultiFetcherStatus>} */
  multiFetcherStates = undefined;

  init() {
    super.init(...arguments);
    this.fetcherToolkit = new ShareListFetcherToolkit({
      shareManager: this.shareManager,
      spaceManager: this.spaceManager,
    });
  }

  @computed('currentUser.user.spaceList.list')
  get spacesIdsProxy() {
    return promiseObject((async () => {
      const user = await this.currentUser.userProxy;
      const spaceList = await user.spaceList;
      return spaceList.hasMany('list').ids().map(gri => parseGri(gri).entityId);
    })());
  }

  handleMultiFetcherStateChange(status, multiFetcher) {
    this.multiFetcherStates.set(multiFetcher, status);
  }

  get progress() {
    if (!this.multiFetcherStates) {
      return 0;
    }
    const states = [...this.multiFetcherStates.values()];
    const settledCount = states.reduce(
      (sum, state) => state === StatusEnum.Settled ? sum + 1 : sum,
      0
    );
    return settledCount / states.length;
  }

  /**
   * Every function in this array is intended to fetch shares (in infinite-scoll way) for
   * n-spaces, where `n` is controlled by `this.spacesBatchSize`.
   * @returns {Promise<Array<(index, limit, offset) => ShareDataListPage>>}
   */
  async prepareFetchers() {
    if (this.isPrepareFetchersPending) {
      throw new Error('SharesChunksArray: only single prepareFetchers can run at a time');
    }
    try {
      this.isPrepareFetchersPending = true;
      const spacesIds = await this.spacesIdsProxy;
      const spacesIdsChunks = _.chunk(spacesIds, this.spacesBatchSize);

      this.multiFetcherStates = new Map();

      (status, currentMultiFetcher) => {
        this.multiFetcherStates.set(currentMultiFetcher, status);
      };
      const multiFetchers = spacesIdsChunks.map(spacesIdsChunk => {
        const multiFetcher = new ShareListMultiFetcher(
          this.fetcherToolkit,
          spacesIdsChunk
        );
        multiFetcher.onStatusChange = this.handleMultiFetcherStateChange.bind(this);
        return multiFetcher;
      });
      return multiFetchers.map(multiFetcher => {
        return (index, limit, offset) => multiFetcher.fetch(index, limit, offset);
      });
    } finally {
      this.isPrepareFetchersPending = false;
    }
  }

  /**
   * @override
   */
  async fetch() {
    const fetchers = await this.prepareFetchers();
    Object.defineProperty(this, 'fetchers', {
      configurable: true,
      get() {
        return fetchers;
      },
    });
    return await super.fetch(...arguments);
  }
}

/**
 * @typedef {'init'|'pending'|'settled'} ShareListMultiFetcherStatus
 */

const StatusEnum = Object.freeze({
  Init: 'init',
  Pending: 'pending',
  Settled: 'settled',
});

class ShareListMultiFetcher {
  /** @type {ShareListMultiFetcherStatus} */
  fetchStatus = StatusEnum.Init;

  /** @type {(status: ShareListMultiFetcherStatus, multiFetcher: ShareListMultiFetcher) => void} */
  onStatusChange = undefined;

  /**
   * @param {Array<string>} spacesIds
   * @param {ShareListFetcherToolkit} fetcherToolkit
   */
  constructor(fetcherToolkit, spacesIds) {
    /** @type {Array<string>}  */
    this.spacesIds = spacesIds;
    /** @type {ShareListFetcherToolkit} */
    this.fetcherToolkit = fetcherToolkit;
  }

  /**
   * @param {InfiniteScrollIndex} index
   * @param {InfiniteScrollLimit} limit
   * @param {InfiniteScrollOffset} offset
   * @returns {Promise<ChunksFetchResult>}
   */
  async fetch(index, limit, offset) {
    try {
      this.changeStatus(StatusEnum.Pending);
      const promises = this.spacesIds.map(spaceId => {
        return this.fetcherToolkit.getShareList(spaceId, {
          index,
          limit,
          offset,
        });
      });
      const results = await allFulfilled(promises);
      return mergeResults(results, { index, size: limit, offset });
    } finally {
      this.changeStatus(StatusEnum.Settled);
    }
  }

  changeStatus(status) {
    if (this.fetchStatus === StatusEnum.Pending && status === StatusEnum.Pending) {
      throw new Error('ShareListMultiFetcher: fetch is already pending');
    }
    if (this.fetchStatus === StatusEnum.Init && status === StatusEnum.Settled) {
      throw new Error(
        'ShareListMultiFetcher: tried to set settled state without pending'
      );
    }
    this.fetchStatus = status;
    this.onStatusChange?.(status, this);
  }
}

class ShareListFetcherToolkit {
  /**
   * @type {Object<string, SharesSidebarItem>}
   */
  shareItemsCacheByIndex = {};

  /**
   * @type {Object<string, SharesSidebarItem>}
   */
  shareItemsCacheById = {};

  constructor({ spaceManager, shareManager }) {
    this.spaceManager = spaceManager;
    this.shareManager = shareManager;
  }

  /**
   * @param {string} spaceId
   * @param {InfiniteListQuery} listQuery
   * @returns {ShareDataListPage}
   */
  async getShareList(spaceId, listQuery) {
    const { index, limit, offset } = listQuery;
    const { array, isLast } = await this.shareManager.getSpaceShareList(spaceId, {
      index,
      limit,
      offset,
    });
    return {
      array: array.map(shareData => this.getShareItem(shareData)),
      isLast,
    };
  }

  /**
   * @private
   * @param {Object} shareData
   * @param {Services.ShareManager} shareManager
   * @param {Services.SpaceManager} spaceManager
   * @returns {SharesSidebarItem}
   */
  getShareItem(shareData) {
    // When properties that are displayed and are variabled: name and handleId changes,
    // then index changes, so the a unique share item should be made for each index.
    const index = shareData.index;
    const id = shareData.shareId;
    let shareItem = this.shareItemsCacheByIndex[index];
    if (shareItem) {
      shareItem.shareData = shareData;
    } else {
      const shareItemById = this.shareItemsCacheById[id];
      if (shareItemById) {
        // index of existing item changed
        shareItem = shareItemById;
        shareItem.shareData = shareData;
      } else {
        shareItem = new SharesSidebarItem({
          shareData,
          shareManager: this.shareManager,
          spaceManager: this.spaceManager,
        });
        this.shareItemsCacheByIndex[index] = shareItem;
        this.shareItemsCacheById[id] = shareItem;
      }
    }
    return shareItem;
  }
}
