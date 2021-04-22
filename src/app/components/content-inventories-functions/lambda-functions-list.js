/**
 * Shows list of lambda functions (passed via `collection` property).
 *
 * @module components/content-inventories-functions/lambda-functions-list
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
  classNames: ['lambda-functions-list'],

  /**
   * @virtual
   * @type {Array<Models.LambdaFunction>}
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
   * @type {ComputedProperty<Array<Models.LambdaFunction>>}
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

      return (collection || []).filter(lambdaFunction => {
        const normalizedName = get(lambdaFunction, 'name').trim().toLowerCase();
        return normalizedName.includes(normalizedSearchValue);
      });
    }
  ),

  /**
   * @type {ComputedProperty<Array<Models.LambdaFunction>>}
   */
  sortedCollection: sort('filteredCollection', 'collectionOrder'),

  actions: {
    changeSearchValue(newValue) {
      debounce(this, 'set', 'searchValue', newValue, isInTestingEnv ? 1 : 300);
    },
  },
});
