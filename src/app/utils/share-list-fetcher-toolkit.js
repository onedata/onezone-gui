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

/**
 * @typedef {Object} ShareListCache
 * @property {Array<SharesSidebarItem>} array
 * @property {boolean} isStartReached
 * @property {boolean} isEndReached
 */

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
    const { index, limit, offset } = listQuery;

    let effIndex = index;
    let effLimit = limit;
    let effOffset = offset;
    let cachedArray;
    let cachedIsLast;

    const spaceFetchCache = this.getSpaceFetchCache(spaceId);
    if (spaceFetchCache && offset >= 0) {
      const fullCachedArray = spaceFetchCache.array;
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
        cachedIsLast =
          (cachedArray.at(-1) === fullCachedArray.at(-1)) && spaceFetchCache.isEndReached;
        // FIXME: new index: trzeba sprawdzić jaki zakres cache można wziąć do wyniku (uwzględnić offset!); wtedy nowym indeksem będzie ostatni index + 1 z fragmentu cache
      } else {
        // FIXME: przekroczyliśmy tablicę: to oznacza, że poprzedni request nie zawierał tego rekordu
        // trzeba więc sprawdzić, czy poprzednim razem nie doszliśmy do końca
        cachedIsLast = spaceFetchCache.isEndReached;
      }
    }
    let backendArray;
    let backendIsLast;
    if (!cachedIsLast && effLimit) {
      const result = await this.shareManager.getSpaceShareList(spaceId, {
        index: effIndex,
        limit: effLimit,
        offset: effOffset,
      });
      backendArray = result.array;
      backendIsLast = result.isLast;
    } else {
      backendArray = [];
      backendIsLast = true;
    }
    this.setSpaceFetchCache(spaceId, {
      array: backendArray,
      isEndReached: backendIsLast,
    });
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

  getSpaceFetchCache(spaceId) {
    return this.spaceFetchCaches[spaceId];
  }

  setSpaceFetchCache(spaceId, spaceFetchCache) {
    this.spaceFetchCaches[spaceId] = spaceFetchCache;
  }
}
