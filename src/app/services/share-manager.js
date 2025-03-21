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
const listSpaceSharesIdsAspect = 'list_shares';

/**
 * @typedef {Object} SpaceShareListOptions
 * @property {boolean} onlyIds
 */

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
   * @param {string} spaceId
   * @param {InfiniteListQuery} listQuery
   * @param {SpaceShareListOptions} options
   * @returns {ShareDataListPage|ShareIdListPage}
   */
  async getSpaceShareList(spaceId, listQuery, options) {
    const onlyIds = Boolean(options?.onlyIds);
    const getListGri = spaceShareListGri(spaceId, onlyIds);
    const { list: array, isLast } = await this.onedataGraph.request({
      gri: getListGri,
      operation: 'create',
      data: listQuery,
      subscribe: false,
    });
    if (!onlyIds) {
      for (const shareData of array) {
        shareData.spaceId = spaceId;
      }
    }
    return { array, isLast };
  }
}

/**
 * @param {string} spaceId
 * @param { boolean } onlyIds If false, generates GRI for fetching list of share data
 *   objects. If true, generates GRI for resource with list of shares IDs only.
 * @returns {string}
 */
export function spaceShareListGri(spaceId, onlyIds = false) {
  return gri({
    entityType: spaceEntityType,
    entityId: spaceId,
    aspect: onlyIds ? listSpaceSharesIdsAspect : listSpaceSharesAspect,
    scope: 'private',
  });
}
