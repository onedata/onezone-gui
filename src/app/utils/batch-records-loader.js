/**
 * Uses batch requests to fetch records with provided GRIs with progress watch.
 *
 * There are two typical usages of this class:
 *
 * 1. Via `getPromise` - when you just want to init, start loaders, and wait for loader
 *    fulfillment (in the meantime using the progressTracker). This is the most common use
 *    case.
 * 2. Using first `initContainers` (initialize containers), then use some code that want
 *    to use loaded data, and then use `startFlush` to start actual loading (and use eg.
 *    progressTracker as in the first use case). Used when you must control when
 *    containers are created and flushed.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @copyright (C) 2025 Onedata (onedata.org)
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import GrisBatchContainerSpec from 'onedata-gui-websocket-client/utils/gris-batch-container-spec';
import { OwsGraphOperation } from 'onedata-gui-websocket-client/services/onedata-graph';
import { DebouncedBatchFlushStrategy } from 'onedata-gui-websocket-client/utils/batch-flush-strategies';
import BatchRequestRegistryService from 'onedata-gui-websocket-client/services/batch-request-registry';
import ProgressTracker from 'onedata-gui-common/utils/progress-tracker';

/**
 * @typedef {Object} FetchBatchRecordsArgs
 * @property {BatchRequestRegistryService} batchRequestRegistry
 * @property {Array<string>} itemsGris List of GRIs that will be fetched using this
 *   loader. For example, when using the loader for a list model relation, get ids from
 *   the list `hasMany` relation (which does not invoke actual fetching).
 * @property {() => Promise<Array<Ember.Model>>} listResolver A function that should
 *   invoke records fetching. The loader does not invoke fetching, but waits for other
 *   piece of code, that starts requests. For example, put here getting a list relation of
 *   list model.
 * @property {ProgressTracker} [progressTracker] Optional external progress tracker to
 *   update loading progress. If not provided, the new, individual progress tracker is
 *   created for this loader. Note, that custom progress tracker will be resetted.
 * @property {number} [batchFetchSize=defaultBatchFetchSize] Override default batch size.
 */

export const defaultBatchFetchSize = 50;

export default class BatchRecordsLoader {
  /** @type {Promise<Array>} */
  #promise;

  /** @type {Array<BatchRequestContainer>} */
  #containers;

  /** @type {boolean} */
  #flushStarted = false;

  /**
   * @param {FetchBatchRecordsArgs} fetchBatchRecordsArgs
   */
  constructor(fetchBatchRecordsArgs) {
    this.validateArgs(fetchBatchRecordsArgs);

    const {
      batchRequestRegistry,
      itemsGris,
      listResolver,
      batchFetchSize = defaultBatchFetchSize,
      progressTracker: customProgressTracker,
    } = fetchBatchRecordsArgs;

    this.batchRequestRegistry = batchRequestRegistry;
    this.itemsGris = _.uniq(itemsGris);
    this.listResolver = listResolver;
    this.batchFetchSize = batchFetchSize;

    /** @type {ProgressTracker} */
    this.progressTracker = customProgressTracker ?? new ProgressTracker();
  }

  get areContainersInitialized() {
    return Boolean(this.#containers);
  }

  /**
   * @returns {Promise<Array>}
   */
  getPromise() {
    if (!this.#promise) {
      this.#promise = this.fetch();
    }
    return this.#promise;
  }

  async initContainers() {
    if (this.#containers) {
      throw new Error('BatchRecordsLoader: containers are already initialized');
    }
    const griArrayChunks = _.chunk(this.itemsGris, this.batchFetchSize);
    const containerPromises = griArrayChunks.map(async (grisChunk) => {
      const containerSpec = new GrisBatchContainerSpec(OwsGraphOperation.Get, grisChunk);
      return await this.batchRequestRegistry.createContainer(
        containerSpec,
        DebouncedBatchFlushStrategy
      );
    });
    this.#containers = await allFulfilled(containerPromises);
    this.progressTracker.reset(this.itemsGris.length);
  }

  async startFlush() {
    if (!this.#containers) {
      throw new Error('BatchRecordsLoader: containers not initialized');
    }
    if (this.#flushStarted) {
      throw new Error('BatchRecordsLoader: flush has been already started');
    }
    this.#flushStarted = true;
    try {
      const listPromise = this.listResolver();
      for (const container of this.#containers) {
        const doneCount = container.containerSpec.gris.length;
        try {
          await container.flush();
        } finally {
          this.batchRequestRegistry.destroyContainer(container);
        }
        this.progressTracker.doneCount += doneCount;
      }
      const list = await listPromise;

      // If record cannot be found, it is either not included in the list or it is
      // destroyed.
      return list.filter((r) => !r?.isDestroyed);
    } finally {
      for (const container of this.#containers) {
        this.batchRequestRegistry.destroyContainer(container);
      }
    }
  }

  /**
   * @protected
   * @returns {Promise<Array>}
   */
  async fetch() {
    await this.initContainers();
    return await this.startFlush();
  }

  /**
   *
   * @param {FetchBatchRecordsArgs} fetchBatchRecordsArgs
   */
  validateArgs(args) {
    if (!(args.batchRequestRegistry instanceof BatchRequestRegistryService)) {
      throw new Error(
        'fetchBatchRecords: batchRequestRegistry must be an instance of BatchRequestRegistry'
      );
    }
    if (
      args.batchFetchSize !== undefined &&
      (
        typeof args.batchFetchSize !== 'number' ||
        args.batchFetchSize <= 0 ||
        !Number.isInteger(args.batchFetchSize)
      )
    ) {
      throw new Error(
        'fetchBatchRecords: batchFetchSize must be undefined or a positive integer'
      );
    }
    if (!Array.isArray(args.itemsGris)) {
      throw new Error(
        'fetchBatchRecords: itemsGris must be an Array of strings'
      );
    }
    if (typeof args.listResolver !== 'function') {
      throw new Error(
        'fetchBatchRecords: listResolver must be a function'
      );
    }
  }

}
