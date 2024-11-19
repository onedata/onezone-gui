/**
 * Common Onezone-side actions for embedded Oneprovider share views
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export default Mixin.create({
  shareManager: service(),

  actions: {
    updateDirId(dirId) {
      return this.get('navigationState').changeRouteAspectOptions({
        dirId,
      });
    },
    // FIXME: może jedna funkcja wystarczy i options (także dla listy idków)
    /**
     * @param {InfiniteListQuery} listQuery
     * @returns {Promise<ShareListItem>}
     */
    async getSpaceShareList(spaceId, listQuery) {
      return await this.shareManager.getSpaceShareList(spaceId, listQuery);
    },
    // async getShareIdList(listQuery) {
    //   return await this.shareManager.getShareIdList(listQuery);
    // },
  },
});
