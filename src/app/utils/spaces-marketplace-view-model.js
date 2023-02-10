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
import { inject as service } from '@ember/service';
import SpacesMarketplaceItem from 'onezone-gui/utils/spaces-marketplace-item';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';

export default EmberObject.extend(OwnerInjector, {
  spaceManager: service(),
  currentUser: service(),

  //#region state

  /**
   * @type {string}
   */
  searchValue: '',

  /**
   * @type {Array<Utils.SpacesMarketplaceItem>}
   */
  entries: undefined,

  //#endregion

  isEmpty: isEmpty('entries'),

  // FIXME: disabled frontend sorting
  // sortOptions: Object.freeze(['isAccessGranted:asc', 'name:asc']),

  /**
   * @type {ComputedProperty<Array<Utils.SpacesMarketplaceItem>>}
   */
  // sortedCollection: sort('spaceItems', 'sortOptions'),

  userSpacesIdsProxy: promise.object(computed(
    'currentUser.user.spaceList.content.list',
    async function userSpacesIds() {
      const currentUserRecord = await this.currentUser.userProxy;
      const spaceList = await get(currentUserRecord, 'spaceList');
      return spaceList.hasMany('list').ids().map(spaceGri => parseGri(spaceGri).entityId);
    }
  )),

  // FIXME: disabled frontend filtering - implement filtering in other level
  /**
   * @type {ComputedProperty<Array<Utils.SpacesMarketplaceItem>>}
   */
  // filteredCollection: computed(
  //   'sortedCollection.[]',
  //   'searchValue',
  //   function filteredCollection() {
  //     return filterSpaces(this.sortedCollection, this.searchValue);
  //   }
  // ),

  init() {
    this._super(...arguments);
    this.initEntries();
  },

  initEntries() {
    const entries = ReplacingChunksArray.create({
      fetch: this.fetchEntries.bind(this),
      startIndex: 0,
      endIndex: 10,
      indexMargin: 5,
    });
    this.set('entries', entries);
  },

  /**
   * @returns {{ array: Array<Utils.SpacesMarketplaceItem>, isLast: boolean }}
   */
  async fetchEntries(index, limit, offset, /* array */ ) {
    const viewModel = this;
    const listingParams = {
      index,
      limit,
      offset,
    };
    const {
      array: recordsArray,
      isLast,
    } = await this.spaceManager.fetchSpacesMarkeplaceInfoRecords(listingParams);
    const array = recordsArray.map(spaceMarketplaceInfo => SpacesMarketplaceItem.create({
      spaceMarketplaceInfo,
      viewModel,
    }));
    return {
      array,
      isLast,
    };
  },

  /**
   * @public
   * @param {string} value
   */
  changeSearchValue(value) {
    this.set('searchValue', value);
  },
});
