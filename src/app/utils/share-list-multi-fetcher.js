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
import GrisBatchContainerSpec from 'onedata-gui-websocket-client/utils/gris-batch-container-spec';
import { OwsGraphOperation } from 'onedata-gui-websocket-client/services/onedata-graph';
import { spaceShareListGri } from 'onezone-gui/services/share-manager';
import { DebouncedBatchFlushStrategy } from 'onedata-gui-websocket-client/utils/batch-flush-strategies';

/**
 * @enum {'init'|'pending'|'settled'}
 */
export const ShareListMultiFetcherStatus = Object.freeze({
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
  fetchStatus = ShareListMultiFetcherStatus.Init;

  //#endregion

  /**
   * @param {BatchRequestRegistryService} batchRequestRegistry
   * @param {ShareListFetcherToolkit} fetcherToolkit
   * @param {Array<string>} spacesIds
   */
  constructor(batchRequestRegistry, fetcherToolkit, spacesIds) {
    /** @type {Array<string>}  */
    this.spacesIds = spacesIds;
    /** @type {ShareListFetcherToolkit} */
    this.fetcherToolkit = fetcherToolkit;
    /** @type {BatchRequestRegistryService} */
    this.batchRequestRegistry = batchRequestRegistry;
  }

  /**
   * @param {InfiniteScrollIndex} index
   * @param {InfiniteScrollLimit} limit
   * @param {InfiniteScrollOffset} offset
   * @returns {Promise<ChunksFetchResult>}
   */
  async fetch(index, limit, offset) {
    try {
      this.changeStatus(ShareListMultiFetcherStatus.Pending);
      const shareListGris = this.spacesIds.map(spaceId => spaceShareListGri(spaceId));
      const containerSpec = new GrisBatchContainerSpec(
        OwsGraphOperation.Create,
        shareListGris
      );
      const batchContainer = await this.batchRequestRegistry.createContainer(
        containerSpec,
        DebouncedBatchFlushStrategy
      );
      try {
        const promises = this.spacesIds.map(spaceId => {
          return this.fetcherToolkit.getShareList(spaceId, {
            index,
            limit,
            offset,
          });
        });
        batchContainer.scheduleFlush();
        const results = await allFulfilled(promises);
        // Setting size to null, because we want full results to be passed down to main
        // merge.
        return mergeResults(results, { index, size: null, offset });
      } finally {
        this.batchRequestRegistry.destroyContainer(batchContainer);
      }
    } finally {
      this.changeStatus(ShareListMultiFetcherStatus.Settled);
    }
  }

  /**
   * @private
   * @param {ShareListMultiFetcherStatus} status
   */
  changeStatus(status) {
    if (status === ShareListMultiFetcherStatus.Init) {
      throw new Error('ShareListMultiFetcher: cannot reinitialize state');
    }
    if (
      this.fetchStatus === ShareListMultiFetcherStatus.Pending &&
      status === ShareListMultiFetcherStatus.Pending
    ) {
      throw new Error('ShareListMultiFetcher: fetch is already pending');
    }
    if (
      this.fetchStatus === ShareListMultiFetcherStatus.Init &&
      status === ShareListMultiFetcherStatus.Settled
    ) {
      throw new Error(
        'ShareListMultiFetcher: tried to set settled state without pending'
      );
    }
    this.fetchStatus = status;
    this.onStatusChange?.(status, this);
  }
}
