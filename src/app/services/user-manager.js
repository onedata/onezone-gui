/**
 * Provides functions that deal with users.
 *
 * @module services/user-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as userEntityType } from 'onezone-gui/models/user';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { promise } from 'ember-awesome-macros';
import { computed, get, getProperties, observer } from '@ember/object';
import onlyFulfilledValues from 'onedata-gui-common/utils/only-fulfilled-values';
import { all as allFulfilled } from 'rsvp';
import ArrayProxy from '@ember/array/proxy';

export default Service.extend({
  onedataGraph: service(),
  store: service(),
  recordManager: service(),

  /**
   * Changes user password
   * @param {string} userEntityId
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns {Promise} resolves if password has been changed successfully
   */
  changeUserPassword(userEntityId, oldPassword, newPassword) {
    const onedataGraph = this.get('onedataGraph');
    return onedataGraph.request({
      gri: gri({
        entityType: userEntityType,
        entityId: userEntityId,
        aspect: 'password',
        scope: 'private',
      }),
      operation: 'update',
      subscribe: false,
      data: {
        oldPassword: oldPassword || null,
        newPassword,
      },
    });
  },

  /**
   * Returns user with specified GRI
   * @param {String} gri
   * @return {Promise<Models.User>} user promise
   */
  getRecord(gri) {
    return this.get('store').findRecord('user', gri);
  },

  /**
   * Returns user with specified entityId
   * @param {String} entityId
   * @return {Promise<Models.User>} user promise
   */
  getRecordById(entityId) {
    const recordGri = gri({
      entityType: userEntityType,
      entityId: entityId,
      aspect: 'instance',
      scope: 'auto',
    });
    return this.getRecord(recordGri);
  },

  /**
   * @param {Models.User} user 
   * @returns {Promise}
   */
  remove(user) {
    return user.destroyRecord();
  },

  /**
   * @returns {PromiseArray<Models.User>}
   */
  getAllKnownUsers() {
    const knownUsersProxy = AllKnownUsersProxyArray.create({
      recordManager: this.get('recordManager'),
    });
    return promiseArray(
      get(knownUsersProxy, 'allUsersProxy').then(() => knownUsersProxy)
    );
  },
});

const AllKnownUsersProxyArray = ArrayProxy.extend({
  /**
   * @type {Service}
   * @virtual
   */
  recordManager: undefined,

  /**
   * @type {ComputedProperty<PromiseArray<Models.User>>}
   */
  allUsersProxy: promise.array(computed(
    'groupsUsersListsProxy.[]',
    'spacesUsersListsProxy.[]',
    function usersProxy() {
      const {
        recordManager,
        groupsUsersListsProxy,
        spacesUsersListsProxy,
      } = this.getProperties(
        'recordManager',
        'groupsUsersListsProxy',
        'spacesUsersListsProxy'
      );
      const usersArray = [];
      return allFulfilled([
        groupsUsersListsProxy,
        spacesUsersListsProxy,
      ]).then(([
        groupsUserLists,
        spacesUsersListsProxy,
      ]) => {
        usersArray.push(recordManager.getCurrentUserRecord());
        groupsUserLists.concat(spacesUsersListsProxy).forEach(usersList =>
          usersArray.push(...usersList.toArray())
        );
        return usersArray.uniqBy('entityId');
      });
    }
  )),

  allUsersProxyObserver: observer('allUsersProxy.[]', function allUsersProxyObserver() {
    const {
      isFulfilled,
      content,
    } = getProperties(this.get('allUsersProxy'), 'isFulfilled', 'content');

    if (isFulfilled) {
      this.set('content', content);
    }
  }),

  init() {
    this._super(...arguments);

    const toSet = {};
    ['group', 'space'].forEach(modelName => {
      toSet[`${modelName}sProxy`] = promise.array(computed(function proxy() {
        return this.get('recordManager').getUserRecordList(modelName)
          .then(recordList => get(recordList, 'list'));
      }));
      toSet[`${modelName}sUsersListsProxy`] = computed(
        `${modelName}sProxy.@each.isReloading`,
        function computedLists() {
          return this.get(`${modelName}sProxy`)
            .then(parents => onlyFulfilledValues(parents.mapBy('effUserList')))
            .then(effLists => onlyFulfilledValues(effLists.compact().mapBy('list')));
        }
      );
    });

    this.setProperties(toSet);
  },
});
