/**
 * Chunks array fetching merged shares from all spaces.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import MergedChunksArray from 'onedata-gui-common/utils/merged-chunks-array';
import { computed } from '@ember/object';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import ShareListMultiFetcher, { ShareListMultiFetcherStatus as MultiFetcherStatusEnum } from './share-list-multi-fetcher';
import ShareListFetcherToolkit from './share-list-fetcher-toolkit';

export default class SharesChunksArray extends MergedChunksArray.extend(OwnerInjector) {
  @service currentUser;
  @service shareManager;
  @service spaceManager;
  @service batchRequestRegistry;

  /**
   * How many spaces will be queried for share list in single batch.
   * @type {number}
   */
  spacesBatchSize = 10;

  //#region state

  /** @type {boolean} */
  isPrepareFetchersPending = false;

  /** @type {Map<ShareListMultiFetcher, ShareListMultiFetcherStatus>} */
  multiFetcherStates = undefined;

  /** @type {ShareListFetcherToolkit} */
  fetcherToolkit = undefined;

  //#endregion

  @computed('currentUser.user.spaceList.list')
  get spacesIdsProxy() {
    return promiseObject((async () => {
      const user = await this.currentUser.userProxy;
      const spaceList = await user.spaceList;
      return spaceList.hasMany('list').ids().map(gri => parseGri(gri).entityId);
    })());
  }

  get progress() {
    if (!this.multiFetcherStates) {
      return 0;
    }
    const states = [...this.multiFetcherStates.values()];
    const settledCount = states.reduce(
      (sum, state) => state === MultiFetcherStatusEnum.Settled ? sum + 1 : sum,
      0
    );
    return settledCount / states.length;
  }

  init() {
    super.init(...arguments);
    this.fetcherToolkit = new ShareListFetcherToolkit({
      shareManager: this.shareManager,
      spaceManager: this.spaceManager,
    });
  }

  /**
   * Use to handle `onStatusChange` callback of ShareListMultiFetcher.
   * @param {StatusEnum} status
   * @param {ShareListMultiFetcher} multiFetcher
   */
  handleMultiFetcherStateChange(status, multiFetcher) {
    this.multiFetcherStates.set(multiFetcher, status);
  }

  /**
   * Every function in this array is intended to fetch shares (in infinite-scoll way) for
   * n-spaces, where `n` is controlled by `this.spacesBatchSize`.
   * @returns {Promise<Array<MergedChunksArrayFetcher>>}
   */
  async prepareFetchers() {
    if (this.isPrepareFetchersPending) {
      throw new Error('SharesChunksArray: only single prepareFetchers can run at a time');
    }
    try {
      this.isPrepareFetchersPending = true;
      const spacesIds = await this.spacesIdsProxy;
      const spacesIdsChunks = _.chunk(spacesIds, this.spacesBatchSize);

      this.multiFetcherStates = new Map();

      (status, currentMultiFetcher) => {
        this.multiFetcherStates.set(currentMultiFetcher, status);
      };
      const multiFetchers = spacesIdsChunks.map(spacesIdsChunk => {
        const multiFetcher = new ShareListMultiFetcher(
          this.batchRequestRegistry,
          this.fetcherToolkit,
          spacesIdsChunk
        );
        multiFetcher.onStatusChange = this.handleMultiFetcherStateChange.bind(this);
        return multiFetcher;
      });
      return multiFetchers.map(multiFetcher => {
        return (index, limit, offset) => multiFetcher.fetch(index, limit, offset);
      });
    } finally {
      this.isPrepareFetchersPending = false;
    }
  }

  /**
   * @override
   */
  async fetch() {
    const fetchers = await this.prepareFetchers();
    Object.defineProperty(this, 'fetchers', {
      configurable: true,
      get() {
        return fetchers;
      },
    });
    return await super.fetch(...arguments);
  }
}
