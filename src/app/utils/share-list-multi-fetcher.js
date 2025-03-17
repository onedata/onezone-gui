/**
 * Class that provides fetch function that gets merged share lists for multiple spaces in
 * single batch.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import { mergeResults } from 'onedata-gui-common/utils/merged-chunks-array';

/**
 * @typedef {'init'|'pending'|'settled'} ShareListMultiFetcherStatus
 */

export const StatusEnum = Object.freeze({
  Init: 'init',
  Pending: 'pending',
  Settled: 'settled',
});

export default class ShareListMultiFetcher {
  /**
   * @virtual
   * @type {(status: ShareListMultiFetcherStatus, multiFetcher: ShareListMultiFetcher) => void}
   */
  onStatusChange = undefined;

  //#region state

  /** @type {ShareListMultiFetcherStatus} */
  fetchStatus = StatusEnum.Init;

  //#endregion

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

  /**
   * @private
   * @param {ShareListMultiFetcherStatus} status
   */
  changeStatus(status) {
    if (status === StatusEnum.Init) {
      throw new Error('ShareListMultiFetcher: cannot reinitialize state');
    }
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
