import EmberObject, { get, computed } from '@ember/object';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { isEmpty, promise, collect, array } from 'ember-awesome-macros';
import { reads, sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import filterObjects from 'onedata-gui-common/utils/filter-objects';

/**
 * @typede
 */

export default EmberObject.extend(OwnerInjector, {
  spaceManager: service(),

  //#region state

  searchValue: '',

  //#endregion

  isEmpty: isEmpty('spaceItems'),

  spaceItemsProxy: promise.object(computed(function spaceItemsProxy() {
    return this.spaceManager.getSpacesMarketplaceData();
  })),

  spaceItems: reads('spaceItemsProxy.content'),

  sortOptions: Object.freeze(['isOwned:asc', 'name:asc']),

  // FIXME: define sorting
  sortedCollection: sort('spaceItems', 'sortOptions'),

  filteredCollection: computed(
    'sortedCollection.[]',
    'searchValue',
    function filteredCollection() {
      return filterObjects(
        this.sortedCollection,
        this.searchValue
      );
    }
  ),

  /**
   * @public
   * @param {string} value
   */
  changeSearchValue(value) {
    this.set('searchValue', value);
  },
});
