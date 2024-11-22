import { inject as service } from '@ember/service';
import SidebarResources from 'onedata-gui-common/services/sidebar-resources';
import { computed } from '@ember/object';
import ReplacingChunksArray from 'onedata-gui-common/utils/replacing-chunks-array';
import { tracked } from '@glimmer/tracking';

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

  // FIXME: rozszerzyć o możliwość ReplacingChunksArray
  /**
   * @param {string} type
   * @returns {Promise<SidebarCollection>}
   */
  async getCollectionFor(type) {
    switch (type) {
      case 'shares':
        await this.shares.initialLoad;
        return new ChunksArraySidebarCollection(
          this.shares
        );
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
      case 'spaces':
        return new ListModelSidebarCollection(
          await this.spaceManager.getSpaces()
        );
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
        // FIXME: można by zrobić reaktywnie za pomocą reads (ale nie było do tej pory)
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

  @computed
  get shares() {
    return ReplacingChunksArray.create({
      fetch: this.getShareList.bind(this),
      startIndex: 0,
      endIndex: 50,
      indexMargin: 10,
      initialJumpIndex: this.initialJumpIndex,
    });
  }

  /**
   * @private
   * @param {string} index
   * @param {number} limit
   * @param {number} offset
   * @returns {ShareDataListPage}
   */
  async getShareList(index, limit, offset) {
    // FIXME: wiele spejsów, MergedChunksArray
    const spaceId = '01789649985817106dc6fe928dff2bfechb70b';
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
}

class SharesSidebarItem {
  shareManager = undefined;
  spaceManaer = undefined;

  // FIXME: zrobić jak w providerze gety "proxy"?
  constructor({ shareData, shareManager, spaceManager }) {
    Object.assign(this, shareData);
    this.shareManager = shareManager;
    this.spaceManager = spaceManager;
  }
  // FIXME: użyć zmiennych
  get id() {
    return `share.${this.entityId}.instance:public`;
  }
  get entityId() {
    return this.shareId;
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

/**
 * @typedef {Object} SidebarCollection
 * @property {Array<any>} array
 * @property {Array<string>} ids
 */

class ChunksArraySidebarCollection {
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

class ListModelSidebarCollection {
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
