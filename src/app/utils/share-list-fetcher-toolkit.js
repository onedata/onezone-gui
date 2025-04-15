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

  constructor({ spaceManager, shareManager }) {
    this.spaceManager = spaceManager;
    this.shareManager = shareManager;
  }

  /**
   * @param {string} spaceId
   * @param {InfiniteListQuery} listQuery
   * @returns {Promise<ShareDataListPage>}
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
