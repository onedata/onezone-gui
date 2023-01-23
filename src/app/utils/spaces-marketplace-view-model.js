/**
 * View model for space marketplace components.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get } from '@ember/object';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { isEmpty, promise } from 'ember-awesome-macros';
import { reads, sort } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import filterSpaces from 'onezone-gui/utils/filter-spaces';

export default EmberObject.extend(OwnerInjector, {
  spaceManager: service(),

  //#region state

  searchValue: '',

  //#endregion

  isEmpty: isEmpty('spaceItems'),

  /**
   * @type {ComputedProperty<PromiseObject<Array<SpaceMarketplaceInfo>>>}
   */
  spaceItemsProxy: promise.object(computed(async function spaceItemsProxy() {
    const listRecord = await this.spaceManager.getSpacesMarketplaceList();
    const records = get(listRecord, 'list').toArray();
    await records.every(record => record.isLoaded);
    return records;
  })),

  /**
   * @type {ComputedProperty<Array<SpaceMarketplaceData>>}
   */
  spaceItems: reads('spaceItemsProxy.content'),

  sortOptions: Object.freeze(['isAccessGranted:asc', 'name:asc']),

  /**
   * @type {ComputedProperty<Array<SpaceMarketplaceData>>}
   */
  sortedCollection: sort('spaceItems', 'sortOptions'),

  /**
   * @type {ComputedProperty<Array<SpaceMarketplaceData>>}
   */
  filteredCollection: computed(
    'sortedCollection.[]',
    'searchValue',
    function filteredCollection() {
      return filterSpaces(this.sortedCollection, this.searchValue);
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
