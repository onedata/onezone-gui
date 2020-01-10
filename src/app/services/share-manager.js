import EmberObject, { computed, observer, get } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as shareEntityType } from 'onezone-gui/models/share';
import { promise } from 'ember-awesome-macros';
import { all as allFulfilled } from 'rsvp';
import _ from 'lodash';
import UserProxyMixin from 'onedata-gui-websocket-client/mixins/user-proxy';

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
        .then(lists => _.flatten(lists.map(list => list.toArray())));
    })),

  idsCache: Object.freeze([]),

  rebuildIdsCache: observer('list.@each.id', function rebuildIdsCache() {
    return this.get('list').then(list => {
      this.set('idsCache', list.mapBy('id'));
    });
  }),

  hasMany(propertyName) {
    if (propertyName === 'list') {
      return {
        ids: () => this.get('idsCache'),
      };
    }
  },
});

export default Service.extend(UserProxyMixin, {
  store: service(),
  currentUser: service(),

  getRecord(id) {
    return this.get('store').findRecord('share', id);
  },

  getShare(shareId, scope = 'private') {
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
    return virtualShareList.rebuildIdsCache().then(() => virtualShareList);
  },

  /**
   * @param {Models.Share} share 
   * @returns {Promise<Models.Space>}
   */
  getSpaceForShare(share) {
    return this.get('userProxy')
      .then(user => get(user, 'spaceList.list'))
      .then(list =>
        allFulfilled(
          _.zip(list.toArray(), list.mapBy('shareList.list'))
        )
      )
      .then(spacesWithShares =>
        spacesWithShares
        .find(([, shares]) => shares.includes(share))
      )
      .then((spaceSharesPair) => {
        if (spaceSharesPair) {
          return spaceSharesPair[0];
        } else {
          throw new Error('space not found for share');
        }
      });
  },
});
