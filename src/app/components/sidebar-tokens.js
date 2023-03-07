/**
 * A sidebar for tokens (extension of `one-sidebar`)
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import { computed, get } from '@ember/object';

export default OneSidebar.extend({
  layout,
  classNames: ['sidebar-tokens'],

  /**
   * @override
   */
  firstLevelItemComponent: 'sidebar-tokens/token-item',

  /**
   * @override
   */
  sidebarType: 'tokens',

  /**
   * @override
   */
  advancedFiltersComponent: 'sidebar-tokens/advanced-filters',

  /**
   * @override
   */
  filteredCollection: computed(
    'sortedCollection.@each.name',
    'filter',
    'advancedFilters',
    function filteredCollection() {
      const collection = this._super(...arguments);

      const {
        type,
        targetModelName,
        targetRecord,
      } = this.get('advancedFilters');

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
        collection : collection.filter(token => {
          return Object.keys(fieldsToFilter)
            .every(field => get(token, field) === fieldsToFilter[field]);
        });
    }
  ),
});
