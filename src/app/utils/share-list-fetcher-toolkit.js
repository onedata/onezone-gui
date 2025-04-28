/**
 * Provides method to get SharesSidebarItems list for space.
 * Sidebar item objects are created basing on shares data and are cached to be not created
 * everytime from scratch for the same data.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { SharesSidebarItem } from 'onezone-gui/utils/shares-sidebar-item';
import getIndexedListPosition from 'onedata-gui-common/utils/get-indexed-list-position';
import compareStringBytes from 'onedata-gui-common/utils/compare-string-bytes';

class SpaceFetchCache {
  constructor(array, isEndReached) {
    /** @type {Array<SharesSidebarItem>} */
    this.array = array;

    /** @type {boolean} */
    this.isEndReached = isEndReached;

    /**
     * Items indexes, before whose there are no items in the array. Eg. for indexes in the
     * array source: `[c, d, e, f, g]`, the `emptyStartIndexes` would be: `[a, a1, a2, b,
     * b1, b2]` etc. There can be infinite number of possible `emptyStartIndexes`, but the
     * specific indexes are added to this collecion when there is a fetchPrev call that
     * returns empty result, so we know, that there should not be more items in the
     * beginning of source.
     * @type {Array<string>}
     */
    this.emptyStartIndexes = [];
  }

  addEmptyStartIndex(index) {
    this.emptyStartIndexes.push(index);
    this.emptyStartIndexes.sort(compareStringBytes);
  }

  isEmptyStartIndex(index) {
    for (let i = this.emptyStartIndexes.length - 1; i >= 0; --i) {
      if (compareStringBytes(index, this.emptyStartIndexes[i]) <= 0) {
        return true;
      }
    }
    return false;
  }
}

/**
 * Provides method to get SharesSidebarItems list for space.
 * Sidebar item objects are created basing on shares data and are cached to be not created
 * everytime from scratch for the same data.
 */
export default class ShareListFetcherToolkit {
  /**
   * @type {Object<string, SharesSidebarItem>}
   */
  shareItemsCacheByIndex = {};

  /**
   * @type {Object<string, SharesSidebarItem>}
   */
  shareItemsCacheById = {};

  /**
   * @type {Object<string, ShareListCache>} Maps space ID -> ShareListCache from last
   *   request.
   */
  spaceFetchCaches;

  constructor({ spaceManager, shareManager }) {
    this.spaceManager = spaceManager;
    this.shareManager = shareManager;

    this.clearSpaceFetchCaches();
  }

  /**
   * @param {string} spaceId
   * @param {InfiniteListQuery} listQuery
   * @returns {Promise<ShareDataListPage>}
   */
  async getShareList(spaceId, listQuery) {
    // Uncomment for debug
    // console.log('getShareList', spaceId, JSON.stringify(listQuery), '\n');

    const { index, limit, offset } = listQuery;

    let effIndex = index;
    let effLimit = limit;
    let effOffset = offset;

    /**
     * A slice of cache that can be used in result.
     * @type {Array<SharesSidebarItem>}
     */
    let cachedArray;

    /**
     * A slice of cached items that will be used to populate the result includes the end
     * of the actual result. No additional backend fetch is needed if doing fetchNext.
     * @type {boolean}
     */
    let cachedIsLast;

    /** @type {SpaceFetchCache} */
    const existingSpaceFetchCache = this.getSpaceFetchCache(spaceId);
    if (existingSpaceFetchCache && offset >= 0) {
      /**
       * All items from last backend fetch in this fetcher.
       * @type {Array<SharesSidebarItem>}
       */
      const fullCachedArray = existingSpaceFetchCache.array;

      /**
       * Array position (index) where latest cache starts useful data slice.
       * @type {number}
       */
      const fullCachePosition = getIndexedListPosition(fullCachedArray, index);

      if (fullCachePosition < fullCachedArray.length) {
        const fragmentLength = Math.min(
          fullCachedArray.length - fullCachePosition,
          limit
        );
        cachedArray = fullCachedArray.slice(
          fullCachePosition,
          fullCachePosition + fragmentLength
        );
        effLimit = limit - fragmentLength;
        effIndex = cachedArray.at(-1).index;
        effOffset += 1;
        cachedIsLast = (cachedArray.at(-1) === fullCachedArray.at(-1)) &&
          existingSpaceFetchCache.isEndReached;
      } else {
        cachedIsLast = existingSpaceFetchCache.isEndReached;
      }
    }
    let backendArray;
    let backendIsLast;
    let backendEmptyStartIndex = false;
    const shouldExecuteFetch = effLimit &&
      (effOffset >= 0 && !cachedIsLast) ||
      (effOffset < 0 && !existingSpaceFetchCache.isEmptyStartIndex(effIndex));

    if (shouldExecuteFetch) {
      const result = await this.shareManager.getSpaceShareList(spaceId, {
        index: effIndex,
        limit: effLimit,
        offset: effOffset,
      });
      backendArray = result.array;
      backendIsLast = result.isLast;
      const isFetchPrev = effLimit === -effOffset;
      if (isFetchPrev && backendArray.length < effLimit) {
        backendEmptyStartIndex = backendArray[0]?.index;
      }
      const newSpaceFetchCache = new SpaceFetchCache(backendArray, backendIsLast);
      this.setSpaceFetchCache(spaceId, newSpaceFetchCache);
      if (backendEmptyStartIndex) {
        newSpaceFetchCache.addEmptyStartIndex(backendEmptyStartIndex);
      }
    } else {
      backendArray = [];
      backendIsLast = true;
    }

    const effArray = cachedArray ? [...cachedArray, ...backendArray] : backendArray;
    const effIsLast = cachedIsLast || backendIsLast;

    return {
      array: effArray.map(shareData => this.getShareItem(shareData)),
      isLast: effIsLast,
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

  clearSpaceFetchCaches() {
    this.spaceFetchCaches = {};
  }

  /**
   * @param {string} spaceId
   * @returns {SpaceFetchCache}
   */
  getSpaceFetchCache(spaceId) {
    return this.spaceFetchCaches[spaceId];
  }

  /**
   * @param {string} spaceId
   * @param {SpaceFetchCache} spaceFetchCache
   */
  setSpaceFetchCache(spaceId, spaceFetchCache) {
    this.spaceFetchCaches[spaceId] = spaceFetchCache;
  }
}
