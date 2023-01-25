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
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';

export default EmberObject.extend(OwnerInjector, {
  spaceManager: service(),
  currentUser: service(),

  //#region state

  searchValue: '',

  //#endregion

  isEmpty: isEmpty('spaceItems'),

  /**
   * @type {ComputedProperty<PromiseObject<DS.ManyArray<Models.SpaceMarketplaceInfo>>>}
   */
  spaceMarketplaceInfosProxy: promise.object(computed(
    async function spaceMarketplaceInfosProxy() {
      const listRecord = await this.spaceManager.getSpacesMarketplaceList(true);
      return await get(listRecord, 'list');
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

  userSpacesIdsProxy: promise.object(computed(
    'currentUser.user.spaceList.content.list',
    async function userSpacesIds() {
      const currentUserRecord = await this.currentUser.userProxy;
      const spaceList = await get(currentUserRecord, 'spaceList');
      return spaceList.hasMany('list').ids().map(spaceGri => parseGri(spaceGri).entityId);
    }
  )),

  /**
   * @type {ComputedProperty<Array<Utils.SpacesMarketplaceItem>>}
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
