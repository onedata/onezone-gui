/**
 * Provides data and backend operations associated with shares.
 *
 * @author Jakub Liput
 * @copyright (C) 2020-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EmberObject, {
  computed,
  observer,
  get,
} from '@ember/object';
import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as shareEntityType } from 'onezone-gui/models/share';
import { promise } from 'ember-awesome-macros';
import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';
import addConflictLabels from 'onedata-gui-common/utils/add-conflict-labels';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import onlyFulfilledValues from 'onedata-gui-common/utils/only-fulfilled-values';
import { ShareListItem } from 'onedata-gui-common/utils/common-shares';

// FIXME: do wyrzucenia
/**
 * This object MUST BE initialzed asychronuosly using `asyncInit()`, eg.
 * ```
 * VirtualShareList.create({
 *   userProxy: this.get('userProxy'),
 * }).asyncInit().then(virtualShareList => doSomethingWith(virtualShareList));
 * ```
 * @type {EmberObject}
 */
export const VirtualShareList = EmberObject.extend({
  /**
   * @virtual
   * @type {PromiseObject<Models.User>}
   */
  userProxy: undefined,

  /**
   * Pretend it's a record
   * @type {any}
   */
  store: true,

  spacesProxy: promise.array(
    computed('userProxy.spaceList.list.content.[]', function spacesProxy() {
      return this.get('userProxy')
        .then(user => get(user, 'spaceList'))
        .then(spaceList => get(spaceList, 'list'));
    })
  ),

  shareLists: promise.array(
    computed('spacesProxy.@each.shareList', function shareLists() {
      return this.get('spacesProxy').then(spaces => {
        return allFulfilled(spaces.mapBy('shareList'));
      });
    })
  ),

  shareListRelations: computed('shareLists.@each.list', function shareListRelations() {
    const fulfilledListPromises = (async () => {
      const shareLists = await this.shareLists;
      return await onlyFulfilledValues(
        shareLists.map(shareList => shareList && get(shareList, 'list')).filter(Boolean)
      );
    })();
    return promiseArray(fulfilledListPromises);
  }),

  list: promise.array(computed('shareListRelations.@each.[]',
    function list() {
      return this.get('shareListRelations')
        .then(lists => _.flatten(lists.invoke('toArray')));
    })),

  globalListConflictLabelsObserver: observer('list.content.@each.{name,conflictLabel}',
    function globalListConflictLabelsObserver() {
      this.get('list')
        .then(list => addConflictLabels(list, 'name', 'entityId'));
    }
  ),

  idsCache: Object.freeze([]),

  rebuildIdsCache: observer('list.@each.id', function rebuildIdsCache() {
    return this.get('list').then(list => {
      this.set('idsCache', list.mapBy('id'));
    });
  }),

  /**
   * This method MUST BE invoked to properly initialize the object.
   * The object can be used only after async resolve of this method.
   * @returns {Promise}
   */
  asyncInit() {
    return this.rebuildIdsCache().then(() => this);
  },

  hasMany(propertyName) {
    if (propertyName === 'list') {
      return {
        ids: () => this.get('idsCache'),
      };
    }
  },

  async reload() {
    await allFulfilled(this.shareLists.invoke('reload'));
    return this;
  },
});

export default Service.extend(UserProxyMixin, {
  store: service(),
  currentUser: service(),
  // FIXME: debug
  spaceManager: service(),

  // FIXME: do wyrzucenia, będzie replacing chunks array (albo nawet MergedChunksArray)
  /**
   * @type {VirtualShareList}
   */
  virtualShareList: undefined,

  getRecord(gri) {
    return this.get('store').findRecord('share', gri);
  },

  getShareById(shareId, scope = 'private') {
    return this.getRecord(
      gri({
        entityType: shareEntityType,
        entityId: shareId,
        aspect: 'instance',
        scope,
      })
    );
  },

  // FIXME: do wyrzucenia
  async getVirtualAllSharesList() {
    if (!this.virtualShareList) {
      const virtualShareList = VirtualShareList.create({
        userProxy: this.userProxy,
      });
      await virtualShareList.asyncInit();
      this.set('virtualShareList', virtualShareList);
    }
    return this.virtualShareList;
  },

  // FIXME: przestanie działać
  /**
   * @param {Models.Share} share
   * @returns {Promise<Models.Space>}
   */
  async getSpaceForShare(share) {
    const shareGri = get(share, 'id');
    const user = await this.userProxy;
    const spaceList = await get(user, 'spaceList');
    const spaces = await get(spaceList, 'list');

    for (const space of spaces.toArray()) {
      let shareList;
      try {
        shareList = await get(space, 'shareList');
      } catch {
        continue;
      }
      if (shareList.hasMany('list')?.ids().includes(shareGri)) {
        return space;
      }
    }
    throw new Error(`space not found for share (${shareGri})`);
  },

  /**
   * @param {InfiniteListQuery} listQuery
   * @returns {ShareDataListPage|ShareIdListPage}
   */
  async getSpaceShareList(spaceId, listQuery) {
    const { index = null, limit = null, offset = 0 } = listQuery;
    const space = await this.spaceManager.getRecordById(spaceId);
    const shareList = await space.shareList;
    const list = await shareList.list;
    const shares = await allFulfilled(list.toArray());
    let listIndex = index ? shares.findIndex(share => share.name === index) : 0;
    if (listIndex === -1) {
      listIndex = 0;
    }
    listIndex += offset;
    const maxIndex = listIndex + (limit ?? 50);
    const array = shares
      .slice(listIndex, listIndex + (limit ?? 50))
      .map(record => {
        const {
          entityId,
          name,
          fileType,
        } = record;
        // FIXME: mocked data
        const shareListItem = new ShareListItem();
        Object.assign(shareListItem, {
          index: name,
          shareId: entityId,
          name,
          rootFileType: fileType,
          rootFileId: 'c2hhcmVHdWlkI2ViYTJlOGIxYjIxZDcwNDg3NzBkZjEzYjEzZDU3ZTBjY2hlZDk5I2VhNjU0ZWI4ZjllMGJkNTNlZTg2ZWJmYTRjNDYwZjViY2hlZDk5I2JhOWFhOGRkYzU4MzZjZTg5YmVlNWYxOTU3ZDg4OThkY2g1ZDQx',
          privateFileId: 'Z3VpZCNmY2RhNjFiMWNlMWY4ZWM5NTg1ZGE5Y2U4YWE1ZDc4M2NoNzJjNiNlYTY1NGViOGY5ZTBiZDUzZWU4NmViZmE0YzQ2MGY1YmNoZWQ5OQ',
          handleId: '2603afe6ef72724eb98c2d309fb66053ch0729',
          sharePublicUrl: 'https://dev-onezone.default.svc.cluster.local/share/5f482aa71ec6764b227c4a8e1e1e9547ch5aa8',
          handlePublicUrl: 'https://dev-onezone.default.svc.cluster.local/share/5f482aa71ec6764b227c4a8e1e1e9547ch5aa8',
        });
        return shareListItem;
      });
    return { array, isLast: maxIndex >= shares.length - 1 };
  },
});
