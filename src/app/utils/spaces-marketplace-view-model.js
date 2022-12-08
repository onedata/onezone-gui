import EmberObject, { get, computed } from '@ember/object';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { isEmpty, promise, collect } from 'ember-awesome-macros';
import { reads } from '@ember/object/computed';
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

  // FIXME: define sorting
  sortedCollection: reads('spaceItems'),

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
