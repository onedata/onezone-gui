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
import SpacesMarketplaceItem from 'onezone-gui/utils/spaces-marketplace-item';

export default EmberObject.extend(OwnerInjector, {
  spaceManager: service(),
  currentUser: service(),

  //#region state

  searchValue: '',

  //#endregion

  isEmpty: isEmpty('spaceItems'),

  /**
   * @type {ComputedProperty<PromiseObject<Array<SpaceMarketplaceInfo>>>}
   */
  spaceMarketplaceInfosProxy: promise.object(computed(
    async function spaceMarketplaceInfosProxy() {
      const listRecord = await this.spaceManager.getSpacesMarketplaceList(true);
      const records = get(listRecord, 'list').toArray();
      await records.every(record => record.isLoaded);
      return records;
    }
  )),

  /**
   * @type {ComputedProperty<PromiseObject<Array<Utils.SpacesMarketplaceItem>>>}
   */
  spaceItemsProxy: promise.object(computed(
    'spaceMarketplaceInfosProxy',
    async function spaceItemsProxy() {
      const spaceMarketplaceInfos = await this.spaceMarketplaceInfosProxy;
      const viewModel = this;
      return spaceMarketplaceInfos.map(spaceMarketplaceInfo =>
        SpacesMarketplaceItem.create({
          spaceMarketplaceInfo,
          viewModel,
        })
      );
    }
  )),

  /**
   * @type {ComputedProperty<Array<Utils.SpacesMarketplaceItem>>}
   */
  spaceItems: reads('spaceItemsProxy.content'),

  sortOptions: Object.freeze(['isAccessGranted:asc', 'name:asc']),

  /**
   * @type {ComputedProperty<Array<Utils.SpacesMarketplaceItem>>}
   */
  sortedCollection: sort('spaceItems', 'sortOptions'),

  userSpacesIds: computed(
    'currentUser.user.spaceList.content.list',
    function userSpacesIds() {
      // Both current and space list should be loaded before reaching spaces marketplace,
      // so do not care about async relationship loading.
      const currentUserRecord = this.currentUser.user;
      const userSpaces = get(currentUserRecord, 'spaceList.content.list').toArray();
      return userSpaces.map(space => get(space, 'entityId'));
    }
  ),

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
