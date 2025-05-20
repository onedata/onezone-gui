/**
 * Returns native array with all records loaded using batch requests.
 *
 * Each batch request has maximum `batchFetchSize` size (every batch except the last has
 * equal `batchFetchSize` size). It updates the provided `progressTracker` automatically.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import GrisBatchContainerSpec from 'onedata-gui-websocket-client/utils/gris-batch-container-spec';
import { OwsGraphOperation } from 'onedata-gui-websocket-client/services/onedata-graph';
import { DebouncedBatchFlushStrategy } from 'onedata-gui-websocket-client/utils/batch-flush-strategies';
import ProgressTracker from 'onedata-gui-common/utils/progress-tracker';
import BatchRequestRegistry from 'onedata-gui-websocket-client/services/batch-request-registry';

const defaultBatchFetchSize = 100;

/**
 * @typedef {Object} FetchBatchRecordsArgs
 * @property {BatchRequestRegistry} batchRequestRegistry
 * @property {ProgressTracker} progressTracker
 * @property {number} [batchFetchSize]
 * @property {Array<string>} itemsGris
 * @property {() => Promise<Array<Ember.Model>>} listResolver
 */

/**
 * @param {FetchBatchRecordsArgs} fetchBatchRecordsArgs
 * @returns {Promise<Array<Ember.Model>>}
 */
export default async function fetchBatchRecords(fetchBatchRecordsArgs) {
  validateArgs(fetchBatchRecordsArgs);
  const {
    batchRequestRegistry,
    progressTracker,
    batchFetchSize = defaultBatchFetchSize,
    itemsGris,
    listResolver,
  } = fetchBatchRecordsArgs;
  const containerPromises = _.chunk(itemsGris, batchFetchSize).map(async (grisChunk) => {
    const containerSpec = new GrisBatchContainerSpec(OwsGraphOperation.Get, grisChunk);
    await batchRequestRegistry.waitForNoConflicts(containerSpec);
    return batchRequestRegistry.createContainer(
      containerSpec,
      DebouncedBatchFlushStrategy
    );
  });
  // FIXME: nie wiem jak to może działać w przypadku konfliktu, bo przecież waitForNoConflicts zawiesi się do momentu jak inny kontener nie zostanie zresolvowany
  const containers = await allFulfilled(containerPromises);
  progressTracker.reset(itemsGris.length);
  try {
    const listPromise = listResolver();
    for (const container of containers) {
      const messagesCount = container.messagesCount;
      try {
        await container.flush();
      } finally {
        batchRequestRegistry.destroyContainer(container);
      }
      progressTracker.doneCount += messagesCount;
    }
    const list = await listPromise;
    // FIXME: dla dużej liczby tokenów ze spejsami jako target, zawiesi ładowanie aż do momentu, kiedy pobierze wszytkie spejsy
    // FIXME: te relacje będą pobierane nie-batchowo
    // FIXME: to by trzeba było zrobić globalny ogarniacz ładowania relacji req.
    // await allFulfilled(list.map(record => record.loadRequiredRelations?.()));

    // If record cannot be found, it is either not included in the list or it is
    // destroyed.
    return list.filter((r) => !r?.isDestroyed);

  } finally {
    for (const container of containers) {
      batchRequestRegistry.destroyContainer(container);
    }
  }
}

/**
 *
 * @param {FetchBatchRecordsArgs} fetchBatchRecordsArgs
 */
function validateArgs(args) {
  if (!(args.progressTracker instanceof ProgressTracker)) {
    throw new Error(
      'fetchBatchRecords: progressTracker must be an instance of ProgressTracker service'
    );
  }
  if (!(args.batchRequestRegistry instanceof BatchRequestRegistry)) {
    throw new Error(
      'fetchBatchRecords: batchRequestRegistry must be an instance of ProgressTracker BatchRequestRegistry'
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
