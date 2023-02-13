/**
 * View model for space marketplace components.
 *
 * @author Jakub Liput
 * @copyright (C) 2022-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, { computed, get, defineProperty } from '@ember/object';
import { reads } from '@ember/object/computed';
import OwnerInjector from 'onedata-gui-common/mixins/owner-injector';
import { isEmpty, promise } from 'ember-awesome-macros';
import { inject as service } from '@ember/service';
import SpacesMarketplaceItem from 'onezone-gui/utils/spaces-marketplace-item';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import filterSpaces from 'onezone-gui/utils/filter-spaces';
import _ from 'lodash';
import { Promise } from 'rsvp';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';

export default EmberObject.extend(OwnerInjector, {
  spaceManager: service(),
  currentUser: service(),

  /**
   * @virtual optional
   * @type {string|null}
   */
  selectedSpaceId: null,

  //#region state

  /**
   * @type {string}
   */
  searchValue: '',

  /**
   * @type {Array<SpaceTag>|null}
   */
  tagsFilter: null,

  /**
   * @type {Array<Utils.SpacesMarketplaceItem>}
   */
  entries: undefined,

  /**
   * @type {Promise}
   */
  entriesInitialLoad: undefined,

  //#endregion

  isEmpty: isEmpty('entries'),

  userSpacesIdsProxy: promise.object(computed(
    'currentUser.user.spaceList.content.list',
    async function userSpacesIds() {
      const currentUserRecord = await this.currentUser.userProxy;
      const spaceList = await get(currentUserRecord, 'spaceList');
      return spaceList.hasMany('list').ids().map(spaceGri => parseGri(spaceGri).entityId);
    }
  )),

  selectedSpaceMarketplaceInfoProxy: promise.object(computed(
    'selectedSpaceId',
    async function selectedSpaceMarketplaceInfoProxy() {
      if (!this.selectedSpaceId) {
        return null;
      }
      return this.spaceManager.getSpaceMarketplaceInfo(this.selectedSpaceId);
    }
  )),

  init() {
    this._super(...arguments);
    // infinite loading before entries array is initialized async
    this.set('entriesInitialLoad', promiseObject(new Promise(() => {})));
    this.initEntries();
  },

  async initEntries() {
    const selectedSpaceMarketplaceInfo = await this.selectedSpaceMarketplaceInfoProxy;
    const initialJumpIndex = selectedSpaceMarketplaceInfo &&
      get(selectedSpaceMarketplaceInfo, 'index') || null;
    const entries = ReplacingChunksArray.create({
      fetch: this.fetchFilteredEntries.bind(this),
      startIndex: 0,
      endIndex: 10,
      indexMargin: 5,
      initialJumpIndex,
    });
    this.set('entries', entries);
    defineProperty(this, 'entriesInitialLoad', reads('entries.initialLoad'));
    // needed after defineProperty
    this.notifyPropertyChange('entriesInitialLoad');
  },

  /**
   * Fetches next chunks of space marketplace items until an array of requested length
   * (`limit`) is made, containing space items that are conforming current search string
   * (`this.searchValue`).
   * @returns {{ array: Array<Utils.SpacesMarketplaceItem>, isLast: boolean }}
   */
  async fetchFilteredEntries(index, limit, offset, array) {
    let finalIsLast = false;
    let currentIndex = index;
    let currentOffset = offset;
    let currentLimit = limit;
    const finalArray = [];
    while (currentLimit && !finalIsLast) {
      const result = await this.fetchEntries(
        currentIndex,
        currentLimit,
        currentOffset,
        array
      );
      const entriesMatchingToAdd = filterSpaces(result.array, this.searchValue)
        .slice(0, limit - finalArray.length);
      finalArray.push(...entriesMatchingToAdd);
      currentIndex = result.array.at(-1)?.index ?? null;
      if (currentIndex === null) {
        break;
      }
      currentOffset = 1;
      currentLimit = Math.min(limit, limit - finalArray.length);
      finalIsLast = result.isLast;
    }
    return {
      array: finalArray,
      isLast: finalIsLast,
    };
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
    const tags = this.tagsFilter ?
      this.tagsFilter.map(({ label }) => label) : undefined;
    const {
      array: recordsArray,
      isLast,
    } = await this.spaceManager.fetchSpacesMarkeplaceInfoRecords(
      listingParams,
      tags
    );
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
    this.entries.scheduleReload({ head: true });
  },

  /**
   * @public
   * @param {Array<SpaceTag>} tags
   */
  changeTagsFilter(tags) {
    this.set('tagsFilter', _.isEmpty(tags) ? null : tags);
    this.entries.scheduleReload({ head: true });
  },
});
