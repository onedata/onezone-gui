/**
 * A sidebar for tokens (extension of `one-sidebar`)
 *
 * @module components/sidebar-tokens
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import OneSidebar from 'onedata-gui-common/components/one-sidebar';
import layout from 'onedata-gui-common/templates/components/one-sidebar';
import { computed } from '@ember/object';

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
      let collection = this._super(...arguments);

      const {
        type,
        targetModelName,
        targetRecord,
      } = this.get('advancedFilters');

      if (type !== 'all') {
        collection = collection.filterBy('typeName', type);

        if (type === 'invite' && targetModelName !== 'all') {
          collection = collection.filterBy('targetModelName', targetModelName);

          if (targetRecord !== null) {
            collection = collection.filterBy('tokenTarget', targetRecord);
          }
        }
      }

      return collection;
    }
  ),
});
