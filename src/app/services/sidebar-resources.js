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
import { tracked } from '@glimmer/tracking';
import { promiseObject } from 'onedata-gui-common/utils/ember/promise-object';
import MergedChunksArray from 'onedata-gui-common/utils/merged-chunks-array';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import computedLastProxyContent from 'onedata-gui-common/utils/computed-last-proxy-content';
import { reads } from '@ember/object/computed';
import gri from 'onedata-gui-websocket-client/utils/gri';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import { entityType as shareEntityType } from 'onezone-gui/models/share';
import VirtualListFetcher from 'onedata-gui-common/utils/virtual-list-fetcher';

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
      case 'providers':
        return new ListModelSidebarCollection(
          await this.providerManager.getProviders()
        );
      case 'clusters':
        return new ListModelSidebarCollection(
          await this.clusterManager.getClusters()
        );
      case 'tokens':
        return new ListModelSidebarCollection(
          await this.tokenManager.getTokens()
        );
      case 'spaces': {
        const spacesChunksArray = await this.spacesChunksArrayProxy;
        await spacesChunksArray.initialLoad;
        return new ChunksArraySidebarCollection(spacesChunksArray);
      }
      case 'groups':
        return new ListModelSidebarCollection(
          await this.groupManager.getGroups()
        );
      case 'harvesters':
        return new ListModelSidebarCollection(
          await this.harvesterManager.getHarvesters()
        );
      case 'atm-inventories':
        return new ListModelSidebarCollection(
          await this.recordManager.getUserRecordList('atmInventory')
        );
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

  @computed
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
        initialJumpIndex: this.initialJumpIndex,
      });
  }

  // FIXME: musi być jakiś observer, żeby kopnąć listę, żeby się przebudowała; albo jakiś event

  @computed()
  get spacesChunksArrayProxy() {
    const promise = (async () => {
      const spaceList = await this.currentUser.user.spaceList;
      const virtualListFetcher = new VirtualListFetcher(spaceList);
      return ReplacingChunksArray.create({
        fetch: (index, limit, offset) => {
          return virtualListFetcher.fetch(index, limit, offset);
        },
        startIndex: 0,
        endIndex: 50,
        indexMargin: 10,
        initialJumpIndex: this.initialJumpIndex,
      });
    })();
    return promiseObject(promise);
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

export class SharesSidebarItem {
  /** @type {ShareListItem} */
  shareData = undefined;

  shareManager = undefined;
  spaceManager = undefined;

  constructor({ shareData, shareManager, spaceManager }) {
    this.shareData = shareData;
    this.shareManager = shareManager;
    this.spaceManager = spaceManager;
  }

  //#region proxied properties

  get index() {
    return this.shareData.index;
  }

  get name() {
    return this.shareData.name;
  }

  get spaceId() {
    return this.shareData.spaceId;
  }

  /** @type {FileType} */
  get rootFileType() {
    return this.shareData.rootFileType;
  }

  get rootFilePrivateId() {
    return this.shareData.rootFilePrivateId;
  }

  get rootFilePublicId() {
    return this.shareData.rootFilePublicId;
  }

  get handleId() {
    return this.shareData.handleId;
  }

  get handlePublicUrl() {
    return this.shareData.handlePublicUrl;
  }

  get sharePublicUrl() {
    return this.shareData.sharePublicUrl;
  }

  //#endregion

  get id() {
    return gri({
      entityType: shareEntityType,
      entityId: this.entityId,
      aspect: 'instance',
      scope: 'private',
    });
  }

  get entityId() {
    return this.shareData.shareId;
  }

  get hasHandle() {
    return Boolean(this.handleId);
  }

  @computed
  get shareProxy() {
    return this.shareManager.getRecord(this.id, { reload: false });
  }
  @computed
  get spaceProxy() {
    return this.spaceManager.getRecordById(this.spaceId, {
      reload: false,
      backgroundReload: false,
    });
  }
}

export class ChunksArraySidebarCollection {
  @tracked chunksArray;

  constructor(chunksArray) {
    this.chunksArray = chunksArray;
  }

  @computed('chunksArray.content.[]')
  get array() {
    return this.chunksArray.toArray();
  }

  get ids() {
    return this.array.map(record => record.id);
  }
}

export class ListModelSidebarCollection {
  @tracked listModel;

  constructor(listModel) {
    this.listModel = listModel;
  }

  @computed('listModel.list.content.[]')
  get array() {
    return this.listModel?.list?.content.toArray();
  }

  get ids() {
    return this.listModel?.belongsTo?.('list')?.ids?.() ?? [];
  }
}
