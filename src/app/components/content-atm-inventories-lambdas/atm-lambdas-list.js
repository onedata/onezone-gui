/**
 * Shows list of lambdas (passed via `collection` property).
 *
 * @module components/content-atm-inventories-lambdas/atm-lambdas-list
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { sort } from '@ember/object/computed';
import { debounce } from '@ember/runloop';
import config from 'ember-get-config';

const isInTestingEnv = config.environment === 'test';

export default Component.extend({
  classNames: ['atm-lambdas-list'],

  /**
   * @virtual
   * @type {Array<Models.AtmLambda>}
   */
  collection: undefined,

  /**
   * @type {String}
   */
  searchValue: '',

  /**
   * @type {Array<String>}
   */
  collectionOrder: Object.freeze(['name']),

  /**
   * @type {ComputedProperty<Array<Models.AtmLambda>>}
   */
  filteredCollection: computed(
    'searchValue',
    'collection.@each.name',
    function filteredCollection() {
      const {
        collection,
        searchValue,
      } = this.getProperties('collection', 'searchValue');
      const normalizedSearchValue = searchValue.trim().toLowerCase();

      return (collection || []).filter(atmLambda => {
        const normalizedName = get(atmLambda, 'name').trim().toLowerCase();
        return normalizedName.includes(normalizedSearchValue);
      });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Models.AtmLambda>>}
   */
  sortedCollection: sort('filteredCollection', 'collectionOrder'),

  actions: {
    changeSearchValue(newValue) {
      debounce(this, 'set', 'searchValue', newValue, isInTestingEnv ? 1 : 300);
    },
  },
});
