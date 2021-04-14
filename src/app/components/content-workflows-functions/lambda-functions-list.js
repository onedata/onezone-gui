import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { sort } from '@ember/object/computed';

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
});
