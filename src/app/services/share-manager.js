/**
 * Provides data and backend operations associated with shares.
 *
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
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
    computed('userProxy.spaceList.list.[]', function spacesProxy() {
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

  shareListRelations: promise.array(
    computed('shareLists.@each.list', function shareListRelations() {
      return this.get('shareLists')
        .then(shareLists => allFulfilled(shareLists.mapBy('list')));
    })
  ),

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

  reload() {
    return allFulfilled(this.get('shareLists').invoke('reload'));
  },
});

export default Service.extend(UserProxyMixin, {
  store: service(),
  currentUser: service(),

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

  getAllShares() {
    const virtualShareList = VirtualShareList.create({
      userProxy: this.get('userProxy'),
    });
    return virtualShareList.asyncInit();
  },

  /**
   * @param {Models.Share} share
   * @returns {Promise<Models.Space>}
   */
  getSpaceForShare(share) {
    return this.get('userProxy')
      .then(user => get(user, 'spaceList'))
      .then(spaceList => get(spaceList, 'list'))
      .then(spaces =>
        allFulfilled(spaces.mapBy('shareList')).then(sl => sl.mapBy('list'))
        .then(shares => _.zip(
          spaces.toArray(),
          shares,
        ))
      )
      .then(spacesWithShares => {
        const spaceSharesPair = spacesWithShares
          .find(([, shares]) => shares.includes(share));
        if (spaceSharesPair) {
          return spaceSharesPair[0];
        } else {
          throw new Error('space not found for share');
        }
      });
  },
});
