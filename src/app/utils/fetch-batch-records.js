/**
 * Returns native array with all records loaded using batch requests.
 *
 * Each batch request has maximum `batchFetchSize` size (every batch except the last has
 * equal `batchFetchSize` size). It updates the `progressTracker` automatically if
 * provided.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import BatchRecordsLoader from './batch-records-loader';

/**
 * @param {FetchBatchRecordsArgs} fetchBatchRecordsArgs
 * @returns {Promise<Array<Ember.Model>>}
 */
export default async function fetchBatchRecords(fetchBatchRecordsArgs) {
  return new BatchRecordsLoader(fetchBatchRecordsArgs).getPromise();
}
