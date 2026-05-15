/**
 * Simulates fetch function for getting infinite scroll data with source from the
 * ListModel.
 *
 * @author Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { tracked } from '@glimmer/tracking';
import { defaultAdvancedFilter } from 'onedata-gui-common/components/one-sidebar';
import ProgressTracker from 'onedata-gui-common/utils/progress-tracker';
import fetchBatchRecords from './fetch-batch-records';
import _ from 'lodash';
import { defaultBatchFetchSize } from './batch-records-loader';
import { getNameWithConflictLabel } from 'onedata-gui-common/components/name-conflict';
import matchIdFilter from './match-id-filter';

/**
 * @typedef {InfiniteScrollItem} ChunkableListModelFetcherItem
 */

export default class ChunkableListModelFetcher {
  listSortKey = 'index';

  /**
   * How many max items should be fetched in single batch.
   * @type {number}
   */
  batchFetchSize = defaultBatchFetchSize;

  /**
   * @type {ProgressTracker}
   */
  progressTracker = new ProgressTracker();

  /**
   * @type {string}
   */
  @tracked
  filterExpression = '';

  /**
   * @type {boolean}
   */
  @tracked
  isSearchById = false;

  /**
   * @type {any}
   */
  @tracked
  filterAdvanced = defaultAdvancedFilter;

  /**
   * @param {GraphListModel} listModel
   * @param {BatchRequestRegistryService} batchRequestRegistry
   */
  constructor(listModel, batchRequestRegistry) {
    if (!listModel) {
      throw new Error(
        'ChunkableListModelFetcher.constructor: listModel is mandatory'
      );
    }
    if (!batchRequestRegistry) {
      throw new Error(
        'ChunkableListModelFetcher.constructor: batchRequestRegistry is mandatory'
      );
    }

    /** @type {GraphListModel} */
    this.listModel = listModel;

    /** @type {BatchRequestRegistryService} */
    this.batchRequestRegistry = batchRequestRegistry;
  }

  /**
   * @param {InfiniteScrollIndex} index
   * @param {InfiniteScrollLimit} limit
   * @param {InfiniteScrollOffset} offset
   * @returns {InfiniteScrollPage}
   */
  async fetch(index, limit, offset) {
    const completeList = await this.getPreparedList();
    const list = this.filterItems(completeList);
    let recordPos = 0;
    if (index !== null) {
      recordPos = list.findIndex(record => record.index === index);
      if (recordPos === -1) {
        recordPos = 0;
      }
    }
    recordPos += offset;
    recordPos = Math.min(recordPos, list.length);
    recordPos = Math.max(recordPos, 0);
    const array = list.slice(recordPos, recordPos + limit);
    return {
      array,
      isLast: array.length < limit,
    };
  }

  setFilter({ expression, advanced, isSearchById = false }) {
    this.filterExpression = expression;
    this.filterAdvanced = advanced;
    this.isSearchById = isSearchById;
  }

  filterItems(items) {
    const itemsByExpression = this.filterByExpression(items);
    if (this.filterAdvanced && this.filterAdvanced !== defaultAdvancedFilter) {
      return this.filterByAdvancedConditions(itemsByExpression, this.filterAdvanced);
    } else {
      return itemsByExpression;
    }
  }

  /**
   * To be overriden by subclasses if it should have advanced filters.
   * @param {Array<T>} items
   * @param {any} advancedFilter
   * @returns {Array<T>}
   */
  filterByAdvancedConditions(items /*, advancedFilter */ ) {
    return items;
  }

  /**
   * Returns native sorted array with all records loaded.
   * @private
   * @returns {Promise<Array<Object>>}
   */
  async getPreparedList() {
    const {
      batchRequestRegistry,
      progressTracker,
      batchFetchSize,
      listModel,
    } = this;
    const itemsGris = this.listModel.hasMany('list').ids();
    const listResolver = async () => {
      try {
        // Awaiting for list might fail when some single records cannot be fetched,
        // but we can still try to read list afterwards.
        await listModel.list;
      } catch {
        console.warn(
          'ChunkableListModelFetcher.listResolver: list cannot be fully resolved, some records may be missing'
        );
      }
      return listModel.list.toArray();
    };

    const records = await fetchBatchRecords({
      batchRequestRegistry,
      progressTracker,
      batchFetchSize,
      itemsGris,
      listResolver,
    });
    return _.sortBy(records, this.listSortKey);
  }

  /**
   * @private
   * @param {Array<T>} items
   * @returns {Array<T>}
   */
  filterByExpression(items) {
    if (!this.filterExpression) {
      return items;
    }
    const queryRegExp = new RegExp(this.filterExpression, 'i');
    return items.filter(item => {
      const result = queryRegExp.test(getNameWithConflictLabel(
        item.name,
        item.conflictLabel
      ));
      if (!result && this.isSearchById) {
        return matchIdFilter(item.entityId, this.filterExpression);
      }
      return result;
    });
  }
}
