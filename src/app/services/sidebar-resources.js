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
   * @param {string} type
   * @returns {Promise<SidebarCollection>}
   */
  async getCollectionFor(type) {
    switch (type) {
      case 'shares': {
        await this.sharesChunksArray.initialLoad;
        return new ChunksArraySidebarCollection(this.sharesChunksArray);
      }
      case 'clusters':
        return new ListModelSidebarCollection(
          await this.clusterManager.getClusters()
        );
      case 'spaces':
      case 'providers':
      case 'groups':
      case 'tokens':
      case 'harvesters':
      case 'atm-inventories':
        return await this.createListChunksCollection(type);
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
      case 'uploads':
        return ['isAllOneproviders:desc', 'name'];
      default:
        return super.getItemsSortingFor(...arguments);
    }
  }

  /**
   * @param {'tokens'|'spaces'|'groups'|'harvesters'|'atm-inventories'} resourceType
   * @returns {Promise<ChunkableListModelSidebarCollection>}
   */
  async createListChunksCollection(resourceType) {
    const camelizedResourceType = camelize(resourceType);
    const chunkableListModel = await this[`${camelizedResourceType}ChunkableListModelProxy`];
    await chunkableListModel.chunksArray.initialLoad;
    return new ChunkableListModelSidebarCollection(chunkableListModel);
  }

  /**
   *
   * @param {'space'|'group'|'provider'|'token'|'linkedAccount'|'cluster'|'harvester'|'atmInventory'} listType
   * @returns {Promise<ChunkableListModel>}
   */
  async resolveUserVirtualList(listType, ChunkableListModelClass = ChunkableListModel) {
    const listRecord = await (await this.currentUser.userProxy)[`${listType}List`];
    return new ChunkableListModelClass(listRecord);
  }

  async reloadShareList() {
    const sharesChunksArray = this.cacheFor('sharesChunksArray');
    if (sharesChunksArray) {
      await sharesChunksArray.scheduleReload();
      await sharesChunksArray.startChanged();
    }
  }
}
