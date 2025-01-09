/**
 * Implements resources for Onezone GUI sidebar.
 *
 * @author Jakub Liput
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';
import { computed, defineProperty } from '@ember/object';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import MergedChunksArray from 'onedata-gui-common/utils/merged-chunks-array';
import computedLastProxyContent from 'onedata-gui-common/utils/computed-last-proxy-content';
import { reads } from '@ember/object/computed';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { SharesSidebarItem } from 'onezone-gui/utils/shares-sidebar-item';
import { ChunksArraySidebarCollection } from 'onezone-gui/utils/chunks-array-sidebar-collection';
import { ListModelSidebarCollection } from 'onezone-gui/utils/list-model-sidebar-collection';
import { VirtualListChunksSidebarCollection } from 'onezone-gui/utils/virtual-list-chunks-sidebar-collection';
import VirtualListChunksArray from 'onedata-gui-common/utils/virtual-list-chunks-array';
import TokensVirtualListChunksArray from 'onezone-gui/utils/tokens-virtual-list-chunks-array';

export default class OnezoneSidebarResources extends SidebarResources {
  @service providerManager;
  @service tokenManager;
  @service tokenActions;
  @service currentUser;
  @service spaceManager;
  @service shareManager;
  @service clusterActions;
  @service spaceActions;
  @service groupManager;
  @service groupActions;
  @service clusterManager;
  @service harvesterManager;
  @service harvesterActions;
  @service uploadManager;
  @service recordManager;
  @service workflowActions;

  /**
   * @override
   */
  modelNameToRouteResourceTypeMapping = Object.freeze(new Map([
    ['atmInventory', 'atm-inventories'],
  ]));

  /**
   * @param {string} type
   * @returns {Promise<SidebarCollection>}
   */
  async getCollectionFor(type) {
    switch (type) {
      case 'shares': {
        await this.fetchersProxy;
        await this.sharesChunksArray.initialLoad;
        return new ChunksArraySidebarCollection(this.sharesChunksArray);
      }
      // FIXME: dla virtual list można ujednolicić - mamy nazwy
      case 'providers': {
        const virtualListChunksArray = await this.providersVirtualListChunksProxy;
        await virtualListChunksArray.chunksArray.initialLoad;
        return new VirtualListChunksSidebarCollection(virtualListChunksArray);
      }
      case 'clusters':
        return new ListModelSidebarCollection(
          await this.clusterManager.getClusters()
        );
      case 'tokens': {
        const virtualListChunksArray = await this.tokensVirtualListChunksProxy;
        await virtualListChunksArray.chunksArray.initialLoad;
        return new VirtualListChunksSidebarCollection(virtualListChunksArray);
      }
      case 'spaces': {
        const virtualListChunksArray = await this.spacesVirtualListChunksProxy;
        await virtualListChunksArray.chunksArray.initialLoad;
        return new VirtualListChunksSidebarCollection(virtualListChunksArray);
      }
      case 'groups': {
        const virtualListChunksArray = await this.groupsVirtualListChunksProxy;
        await virtualListChunksArray.chunksArray.initialLoad;
        return new VirtualListChunksSidebarCollection(virtualListChunksArray);
      }
      case 'harvesters': {
        const virtualListChunksArray = await this.harvestersVirtualListChunksProxy;
        await virtualListChunksArray.chunksArray.initialLoad;
        return new VirtualListChunksSidebarCollection(virtualListChunksArray);
      }
      case 'atm-inventories': {
        const virtualListChunksArray = await this.atmInventoriesVirtualListChunksProxy;
        await virtualListChunksArray.chunksArray.initialLoad;
        return new VirtualListChunksSidebarCollection(virtualListChunksArray);
      }
      case 'uploads': {
        // TODO: VFS-12506 Maybe do it reactive with reads (but it was not earlier)
        const sidebarOneproviders = this.uploadManager.sidebarOneproviders;
        return {
          get array() {
            return sidebarOneproviders;
          },
          get ids() {
            return sidebarOneproviders.map(record => record.id);
          },
        };
      }
      case 'users': {
        const user = await this.currentUser.getCurrentUserRecord();
        return {
          get array() {
            return [user];
          },
          get ids() {
            return [user.id];
          },
        };
      }
      default:
        throw new Error('No such collection: ' + type);
    }
  }

  /**
   * @override
   */
  getButtonsFor(type, context) {
    const actionsSource = {
      'clusters': this.clusterActions,
      'tokens': this.tokenActions,
      'spaces': this.spaceActions,
      'groups': this.groupActions,
      'harvesters': this.harvesterActions,
      'atm-inventories': this.workflowActions,
    } [type];
    return actionsSource?.createGlobalActions(context) ?? [];
  }

  /**
   * @override
   */
  getItemsSortingFor(resourceType) {
    switch (resourceType) {
      case 'tokens':
        return ['isActive:desc', 'isObsolete', 'name'];
      case 'uploads':
        return ['isAllOneproviders:desc', 'name'];
      default:
        return super.getItemsSortingFor(...arguments);
    }
  }

  @computed('currentUser.user.spaceList.list')
  get spacesIdsProxy() {
    return promiseObject((async () => {
      const user = this.currentUser.user;
      const spaceList = await user.spaceList;
      return spaceList.hasMany('list').ids().map(gri => parseGri(gri).entityId);
    })());
  }

  /**
   * @type {PromiseObject<Array<(index, limit, offset) => ShareDataListPage>>}
   */
  @computed('spacesIdsProxy')
  get fetchersProxy() {
    return promiseObject((async () => {
      const spacesIds = await this.spacesIdsProxy;
      return spacesIds.map(spaceId => {
        return (index, limit, offset) => {
          return this.getShareList(spaceId, {
            index,
            limit,
            offset,
          });
        };
      });
    })());
  }

  @computed()
  get sharesChunksArray() {
    const sidebarResources = this;
    return MergedChunksArray
      .extend({
        fetchers: reads('sidebarResources.fetchersProxy.content'),
      })
      .create({
        sidebarResources,
        startIndex: 0,
        endIndex: 50,
        indexMargin: 10,
      });
  }

  /**
   * @type {PromiseObject<VirtualListChunksArray>}
   */
  @computed()
  get spacesVirtualListChunksProxy() {
    return promiseObject(this.resolveUserVirtualList('space'));
  }

  /**
   * @type {PromiseObject<VirtualListChunksArray>}
   */
  @computed()
  get groupsVirtualListChunksProxy() {
    return promiseObject(this.resolveUserVirtualList('group'));
  }

  /**
   * @type {PromiseObject<VirtualListChunksArray>}
   */
  @computed()
  get atmInventoriesVirtualListChunksProxy() {
    return promiseObject(this.resolveUserVirtualList('atmInventory'));
  }

  /**
   * @type {PromiseObject<VirtualListChunksArray>}
   */
  @computed()
  get providersVirtualListChunksProxy() {
    return promiseObject(this.resolveUserVirtualList('provider'));
  }

  /**
   * @type {PromiseObject<VirtualListChunksArray>}
   */
  @computed()
  get tokensVirtualListChunksProxy() {
    return promiseObject(
      this.resolveUserVirtualList('token', TokensVirtualListChunksArray)
    );
  }

  /**
   * @type {PromiseObject<VirtualListChunksArray>}
   */
  @computed()
  get harvestersVirtualListChunksProxy() {
    return promiseObject(this.resolveUserVirtualList('harvester'));
  }

  /**
   *
   * @param {'space'|'group'|'provider'|'token'|'linkedAccount'|'cluster'|'harvester'|'atmInventory'} listType
   * @returns {Promise<VirtualListChunksArray>}
   */
  async resolveUserVirtualList(listType, VirtualListClass = VirtualListChunksArray) {
    const listRecord = await (await this.currentUser.userProxy)[`${listType}List`];
    return new VirtualListClass(listRecord);
  }

  init() {
    super.init(...arguments);
    defineProperty(this, 'fetchers', computedLastProxyContent('fetchersProxy'));
  }

  /**
   * @private
   * @param {string} spaceId
   * @param {InfiniteListQuery} listQuery
   * @returns {ShareDataListPage}
   */
  async getShareList(spaceId, listQuery) {
    const { index, limit, offset } = listQuery;
    const { array, isLast } = await this.shareManager.getSpaceShareList(spaceId, {
      index,
      limit,
      offset,
    });
    const shareManager = this.shareManager;
    const spaceManager = this.spaceManager;
    return {
      array: array.map(shareData => new SharesSidebarItem({
        shareData,
        shareManager,
        spaceManager,
      })),
      isLast,
    };
  }

  async reloadShareList() {
    await this.cacheFor('sharesChunksArray')?.scheduleReload();
  }
}
