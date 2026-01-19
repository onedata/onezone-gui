/**
 * Common Onezone-side actions for embedded Oneprovider share views
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
 * @copyright (C) 2026 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export const commonShareActions = Object.freeze([
  'getSpaceShareList',
  'reloadCurrentShareRecord',
]);

export default Mixin.create({
  shareManager: service(),

  actions: {
    updateDirId(dirId) {
      return this.navigationState.changeRouteAspectOptions({
        dirId,
      });
    },

    /**
     * @param {ShareShowTabId} tabId
     * @returns {Transitino}
     */
    updateTabId(tabId) {
      return this.navigationState.changeRouteAspectOptions({
        tabId,
      });
    },

    /**
     * @param {string} spaceId
     * @param {InfiniteListQuery} listQuery
     * @param {SpaceShareListOptions} options
     * @returns {Promise<ShareListItem>}
     */
    async getSpaceShareList(spaceId, listQuery, options) {
      return await this.shareManager.getSpaceShareList(spaceId, listQuery, options);
    },

    async reloadCurrentShareRecord(shareId) {
      const effShareId = shareId ?? this.shareId;
      if (!effShareId) {
        return;
      }
      const share = await this.shareManager?.getShareById(effShareId);
      await share?.reload();
    },
  },
});
