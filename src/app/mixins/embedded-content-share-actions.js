/**
 * Common Onezone-side actions for embedded Oneprovider share views
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export const commonShareActions = Object.freeze([
  'getSpaceShareList',
  'reloadCurrentShareRecord',
  'reloadShareList',
]);

export default Mixin.create({
  shareManager: service(),
  sidebarResources: service(),

  actions: {
    updateDirId(dirId) {
      return this.get('navigationState').changeRouteAspectOptions({
        dirId,
      });
    },
    // FIXME: dodać options?
    /**
     * @param {InfiniteListQuery} listQuery
     * @returns {Promise<ShareListItem>}
     */
    async getSpaceShareList(spaceId, listQuery) {
      return await this.shareManager.getSpaceShareList(spaceId, listQuery);
    },

    async reloadCurrentShareRecord(shareId) {
      const effShareId = shareId ?? this.shareId;
      if (!effShareId) {
        return;
      }
      const share = await this.shareManager?.getShareById(effShareId);
      await share?.reload();
    },

    async reloadShareList() {
      await this.sidebarResources.reloadShareList();
    },
  },
});
