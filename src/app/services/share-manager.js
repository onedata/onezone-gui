/**
 * Provides data and backend operations associated with shares.
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as shareEntityType } from 'onezone-gui/models/share';
import { entityType as spaceEntityType } from 'onezone-gui/models/space';

const listSpaceSharesAspect = 'list_shares_with_data';

export default class ShareManager extends Service {
  @service store;
  @service spaceManager;
  @service onedataGraph;

  getRecord(gri) {
    return this.store.findRecord('share', gri);
  }

  /**
   *
   * @param {string} shareId
   * @param {'auto'|'private'|'public'} scope
   * @returns
   */
  getShareById(shareId, scope = 'auto') {
    return this.getRecord(
      gri({
        entityType: shareEntityType,
        entityId: shareId,
        aspect: 'instance',
        scope,
      })
    );
  }

  /**
   * @param {InfiniteListQuery} listQuery
   * @returns {ShareDataListPage|ShareIdListPage}
   */
  async getSpaceShareList(spaceId, listQuery) {
    const getListGri = gri({
      entityType: spaceEntityType,
      entityId: spaceId,
      aspect: listSpaceSharesAspect,
      scope: 'private',
    });
    const { list: array, isLast } = await this.onedataGraph.request({
      gri: getListGri,
      operation: 'create',
      data: listQuery,
      subscribe: false,
    });
    for (const shareData of array) {
      shareData.spaceId = spaceId;
    }
    return { array, isLast };
  }
}
