/**
 * Simulates fetch function for getting infinite scroll data with source from the
 * ListModel.
 *
 * @author Jakub Liput
 * @copyright (C) 2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import VirtualListFetcher from 'onedata-gui-common/utils/virtual-list-fetcher';

/**
 * @typedef {Object} VirtualListFetcherItem
 * @property {string} index
 */

export default class TokensVirtualListFetcher extends VirtualListFetcher {
  /**
   * @override
   * @param {Array<Models.Token>} items
   * @returns {Array<Models.Token>}
   */
  filterItems(items) {
    // FIXME: w sumie to mogłoby być w ogólnej klasie z virtual filterByAdvancedConditions do implementacji
    const itemsByExpression = super.filterItems(items);
    if (this.filterAdvanced) {
      return this.filterByAdvancedConditions(itemsByExpression, this.filterAdvanced);
    } else {
      return itemsByExpression;
    }
  }

  /**
   * @private
   * @param {Array<Models.Token>} items
   * @param {TokensSidebarAdvancedFilter} advancedFilter
   * @returns {Array<Models.Token>}
   */
  filterByAdvancedConditions(items, advancedFilter) {
    const {
      type,
      targetModelName,
      targetRecord,
    } = advancedFilter;

    const fieldsToFilter = {};
    if (type !== 'all') {
      fieldsToFilter.typeName = type;

      if (type === 'invite' && targetModelName !== 'all') {
        fieldsToFilter.targetModelName = targetModelName;

        if (targetRecord !== null) {
          fieldsToFilter.tokenTarget = targetRecord;
        }
      }
    }

    return !Object.keys(fieldsToFilter).length ?
      items : items.filter(token => {
        return Object.keys(fieldsToFilter)
          .every(field => token[field] === fieldsToFilter[field]);
      });
  }
}
