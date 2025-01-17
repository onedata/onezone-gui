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

export default class SharesChunksArray extends MergedChunksArray.extend(OwnerInjector) {
  @service currentUser;
  @service shareManager;
  @service spaceManager;

  /**
   * @type {Object<string, SharesSidebarItem>}
   */
  shareItemsCache = {};

  @computed('currentUser.user.spaceList.list')
  get spacesIdsProxy() {
    return promiseObject((async () => {
      const user = await this.currentUser.userProxy;
      const spaceList = await user.spaceList;
      return spaceList.hasMany('list').ids().map(gri => parseGri(gri).entityId);
    })());
  }

  /**
   * Every function in this array is intended to fetch shares (in infinite-scoll way) for
   * single space.
   * @type {PromiseObject<Array<(index, limit, offset) => ShareDataListPage>>}
   */
  @computed('spacesIdsProxy')
  get fetchersProxy() {
    return promiseObject((async () => {
      const spacesIds = await this.spacesIdsProxy;
      return spacesIds.map(spaceId => {
        return (index, limit, offset) => {
          return this.getShareList(spaceId, {
            index,
            limit,
            offset,
          });
        };
      });
    })());
  }

  @reads('fetchersProxy.content') fetchers;

  /**
   * @override
   */
  async fetch() {
    while (!this.fetchersProxy.isSettled) {
      await this.fetchersProxy;
    }
    return await super.fetch(...arguments);
  }

  /**
   * @private
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
    const shareManager = this.shareManager;
    const spaceManager = this.spaceManager;
    return {
      array: array.map(shareData => this.getShareItem(
        shareData,
        shareManager,
        spaceManager,
      )),
      isLast,
    };
  }

  getShareItem(shareData, shareManager, spaceManager) {
    const id = shareData.index;
    let shareItem = this.shareItemsCache[id];
    if (shareItem) {
      shareItem.shareData = shareData;
    } else {
      shareItem = new SharesSidebarItem({
        shareData,
        shareManager,
        spaceManager,
      });
      this.shareItemsCache[id] = shareItem;
    }
    return shareItem;
  }
}
