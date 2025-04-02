/**
 * Implements resources for Onezone GUI sidebar.
 *
 * @author Jakub Liput
 * @copyright (C) 2024-2025 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';
import { computed } from '@ember/object';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import { ChunksArraySidebarCollection } from 'onezone-gui/utils/chunks-array-sidebar-collection';
import { ListModelSidebarCollection } from 'onezone-gui/utils/list-model-sidebar-collection';
import { ChunkableListModelSidebarCollection } from 'onezone-gui/utils/chunkable-list-model-sidebar-collection';
import ChunkableListModel from 'onedata-gui-common/utils/chunkable-list-model';
import TokensChunkableListModel from 'onezone-gui/utils/tokens-chunkable-list-model';
import SharesChunksArray from 'onezone-gui/utils/shares-chunks-array';
import { camelize } from '@ember/string';
import SidebarModelLoader from 'onedata-gui-common/utils/sidebar-model-loader';
import { defer } from 'rsvp';

/**
 * Subset of OnedataResourceCategory whose list are obained from user record for sidebar.
 * @typedef {'spaces'|'groups'|'providers'|'tokens'|'harvesters'|'atm-inventories'} OnezoneUserListResourceCategory
 */

export default class OnezoneSidebarResourcesService extends SidebarResources {
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
  @service batchRequestRegistry;

  /**
   * @override
   */
  modelNameToRouteResourceTypeMapping = Object.freeze(new Map([
    ['atmInventory', 'atm-inventories'],
  ]));

  /**
   * @type {SharesChunksArray}
   */
  @computed()
  get sharesChunksArray() {
    return SharesChunksArray.create({
      ownerSource: this,
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
    });
  }

  /**
   * @type {PromiseObject<ChunkableListModel>}
   */
  @computed()
  get spacesChunkableListModelProxy() {
    return promiseObject(this.resolveUserVirtualList('space'));
  }

  /**
   * @type {PromiseObject<ChunkableListModel>}
   */
  @computed()
  get groupsChunkableListModelProxy() {
    return promiseObject(this.resolveUserVirtualList('group'));
  }

  /**
   * @type {PromiseObject<ChunkableListModel>}
   */
  @computed()
  get atmInventoriesChunkableListModelProxy() {
    return promiseObject(this.resolveUserVirtualList('atmInventory'));
  }

  /**
   * @type {PromiseObject<ChunkableListModel>}
   */
  @computed()
  get providersChunkableListModelProxy() {
    return promiseObject(this.resolveUserVirtualList('provider'));
  }

  /**
   * @type {PromiseObject<TokensChunkableListModel>}
   */
  @computed()
  get tokensChunkableListModelProxy() {
    return promiseObject(
      this.resolveUserVirtualList('token', TokensChunkableListModel)
    );
  }

  /**
   * @type {PromiseObject<ChunkableListModel>}
   */
  @computed()
  get harvestersChunkableListModelProxy() {
    return promiseObject(this.resolveUserVirtualList('harvester'));
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
      case 'uploads':
        return ['isAllOneproviders:desc', 'name'];
      default:
        return super.getItemsSortingFor(...arguments);
    }
  }

  /**
   * @override
   * @param {OnedataResourceCategory} resourceCategory
   * @returns {SidebarModelLoader}
   */
  createSidebarModelLoader(resourceCategory) {
    switch (resourceCategory) {
      case 'spaces':
      case 'providers':
      case 'groups':
      case 'tokens':
      case 'harvesters':
      case 'atm-inventories':
        return this.createListSidebarModelLoader(resourceCategory);
      case 'shares':
        return this.createSharesSidebarModelLoader();
      case 'clusters':
        return this.createClustersSidebarModelLoader();
      case 'uploads':
        return this.createUploadsSidebarModelLoader();
      case 'users':
        return this.createUsersSidebarModelLoader();
      default:
        throw new Error('SidebarResources: no such collection: ' + resourceCategory);
    }
  }

  /**
   *
   * @param {'space'|'group'|'provider'|'token'|'linkedAccount'|'cluster'|'harvester'|'atmInventory'} listType
   * @returns {Promise<ChunkableListModel>}
   */
  async resolveUserVirtualList(listType, ChunkableListModelClass = ChunkableListModel) {
    const listModel = await (await this.currentUser.userProxy)[`${listType}List`];
    return new ChunkableListModelClass({
      listModel,
      batchRequestRegistry: this.batchRequestRegistry,
    });
  }

  async reloadShareList() {
    const sharesChunksArray = this.cacheFor('sharesChunksArray');
    if (sharesChunksArray) {
      await sharesChunksArray.scheduleReload();
      await sharesChunksArray.startChanged();
    }
  }

  /**
   * @private
   * @param {OnezoneUserListResourceCategory} resourceType
   * @returns {SidebarModelLoader}
   */
  createListSidebarModelLoader(resourceType) {
    const deferred = defer();
    const sidebarModelLoader = new SidebarModelLoader(resourceType, deferred.promise);
    // Code below resolves collection for SidebarModelLoader, but also initializes its
    // progressTracker.
    (async () => {
      const camelizedResourceType = camelize(resourceType);
      const chunkableListModel =
        await this[`${camelizedResourceType}ChunkableListModelProxy`];
      sidebarModelLoader.progressTracker = chunkableListModel.progressTracker;
      await chunkableListModel.chunksArray.initialLoad;
      deferred.resolve(new ChunkableListModelSidebarCollection(chunkableListModel));
    })();
    return sidebarModelLoader;
  }

  /**
   * @private
   * @returns {SidebarModelLoader}
   */
  createSharesSidebarModelLoader() {
    const sidebarCollectionPromise = (async () => {
      await this.sharesChunksArray.initialLoad;
      return new ChunksArraySidebarCollection(this.sharesChunksArray);
    })();
    const sidebarModelLoader = new SidebarModelLoader('shares', sidebarCollectionPromise);
    sidebarModelLoader.progressTracker = this.sharesChunksArray.progressTracker;
    return sidebarModelLoader;
  }

  /**
   * @private
   * @returns {SidebarModelLoader}
   */
  createClustersSidebarModelLoader() {
    const collectionResolver = async () => new ListModelSidebarCollection(
      await this.clusterManager.getClusters()
    );
    return new SidebarModelLoader('clusters', collectionResolver());
  }

  /**
   * @private
   * @returns {SidebarModelLoader}
   */
  createUploadsSidebarModelLoader() {
    // TODO: VFS-12506 Maybe do it reactive with reads (but it was not earlier)
    const sidebarOneproviders = this.uploadManager.sidebarOneproviders;
    const collectionResolver = async () => ({
      get array() {
        return sidebarOneproviders;
      },
      get ids() {
        return sidebarOneproviders.map(record => record.id);
      },
    });
    return new SidebarModelLoader('uploads', collectionResolver());
  }

  /**
   * @private
   * @returns {SidebarModelLoader}
   */
  createUsersSidebarModelLoader() {
    const collectionResolver = async () => {
      const user = await this.currentUser.getCurrentUserRecord();
      return {
        get array() {
          return [user];
        },
        get ids() {
          return [user.id];
        },
      };
    };
    return new SidebarModelLoader('users', collectionResolver());
  }
}
