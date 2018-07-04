/**
 * Provides data for routes and components assoctiated with groups tab.
 *
 * @module services/group-manager
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { get } from '@ember/object';
import _ from 'lodash';
import { Promise, resolve, reject } from 'rsvp';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import leaveRelation from 'onedata-gui-websocket-client/utils/leave-relation';

export default Service.extend({
  store: service(),
  onedataGraph: service(),
  currentUser: service(),
  spaceManager: service(),
  providerManager: service(),

  /**
   * Fetches collection of all groups
   * 
   * @return {Promise<DS.RecordArray<GroupList>>} resolves to an array of groups
   */
  getGroups() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('groupList'));
  },

  /**
   * Returns group with specified id
   * @param {string} id
   * @param {boolean} backgroundReload
   * @return {Promise<Group>} group promise
   */
  getRecord(id, backgroundReload = true) {
    const store = this.get('store');
    const existingRecord = !backgroundReload && store.peekRecord('group', id);
    return existingRecord ? resolve(existingRecord) : store.findRecord('group', id);
  },

  /**
   * Creates new group
   * @param {object} group group representation
   * @returns {Promise<Group>}
   */
  createRecord(group) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => {
        return this.get('store').createRecord('group', _.merge({}, group, {
            _meta: {
              authHint: ['asUser', get(user, 'entityId')],
            },
          }))
          .save()
          .then(group => this.reloadList().then(() => group));
      });
  },

  /**
   * Joins user to a group using given token
   * @param {string} token
   * @returns {Promise<Group>}
   */
  joinGroup(token) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.joinGroup(token)
        .then(group => Promise.all([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
        ]).then(() => group))
      );
  },

  /**
   * Removes user from a group
   * @param {string} id group id
   * @returns {Promise}
   */
  leaveGroup(id) {
    let entityId;
    try {
      entityId = parseGri(id).entityId;
    } catch (e) {
      return reject(e);
    }
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.leaveGroup(entityId))
      .then(destroyResult =>{
        return Promise.all([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
          this.updateGroupPresenceInActualSpaces(entityId),
        ]).then(() => destroyResult);
      });
  },

  /**
   * Deletes group
   * @param {string} id group id
   * @returns {Promise}
   */
  deleteRecord(id) {
    let group;
    return this.getRecord(id, false)
      .then(g => {
        group = g;
        return group.destroyRecord();
      })
      .then(destroyResult =>{
        return Promise.all([
          this.updateGroupPresenceInActualParents(get(group, 'entityId')),
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
          this.updateGroupPresenceInActualSpaces(get(group, 'entityId')),
        ]).then(() => destroyResult);
      });
  },

  /**
   * Joins group to a space using token
   * @param {Group} group 
   * @param {string} token
   * @returns {Promise<Space>}
   */
  joinGroupToSpace(group, token) {
    return group.joinSpace(token)
      .then(space =>
        Promise.all([
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
          space.belongsTo('groupList').reload(true),
        ]).then(() => space)
      );
  },

  /**
   * Joins group as a subgroup
   * @param {Group} group 
   * @param {string} token
   * @returns {Promise<Group>} parent group
   */
  joinGroupAsSubgroup(group, token) {
    return group.joinGroup(token)
      .then(group =>
        Promise.all([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
          group.belongsTo('childList').reload(true),
        ]).then(() => group)
      );
  },

  /**
   * Reloads group list
   * @returns {Promise<GroupList>}
   */
  reloadList() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.belongsTo('groupList').reload(true));
  },

  /**
   * Updates child lists in actual (not reloaded) parents of given group
   * @param {string} entityId 
   * @returns {Array<Promise>}
   */
  updateGroupPresenceInActualParents(entityId) {
    const groups = this.get('store').peekAll('group');

    return Promise.all(groups.map(group => {
      let parentChildList = group.belongsTo('childList').value();
      parentChildList = parentChildList ?
        parentChildList.hasMany('list').value() : null;
      if (parentChildList &&
        parentChildList.map(g => get(g, 'entityId')).includes(entityId)) {
        return group.belongsTo('childList').value().reload()
          .catch(this.ignoreForbidden);
      } else {
        return resolve();
      }
    }));
  },

  /**
   * Updates group lists in actual (not reloaded) spaces
   * @param {string} entityId 
   * @returns {Array<Promise>}
   */
  updateGroupPresenceInActualSpaces(entityId) {
    const spaces = this.get('store').peekAll('space');

    return Promise.all(spaces.map(space => {
      let spaceGroupList = space.belongsTo('groupList').value();
      spaceGroupList = spaceGroupList ?
        spaceGroupList.hasMany('list').value() : null;
      if (spaceGroupList &&
        spaceGroupList.map(g => get(g, 'entityId')).includes(entityId)) {
        return space.belongsTo('groupList').value().reload()
          .catch(this.ignoreForbidden);
      } else {
        return resolve();
      }
    }));
  },

  /**
   * Returns already loaded group by entityId (or undefined if not loaded)
   * @param {string} entityId 
   * @returns {Group|undefined}
   */
  getLoadedGroupByEntityId(entityId) {
    return this.get('store').peekAll('group')
      .filter(g => get(g, 'entityId') === entityId)[0];
  },

  /**
   * Reloads selected list from group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId 
   * @param {string} listName
   * @returns {Promise}
   */
  reloadModelList(entityId, listName) {
    const group = this.getLoadedGroupByEntityId(entityId);
    if (group) {
      const list = group.belongsTo(listName).value();
      const hasMany = list ? list.hasMany('list').value() : null;
      if (list) {
        return list.reload().then(result => {
          return hasMany ? list.hasMany('list').reload() : result;
        });
      }
    }
    return resolve();
  },

  /**
   * Reloads parentList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId
   * @returns {Promise}
   */
  reloadParentList(entityId) {
    return this.reloadModelList(entityId, 'parentList');
  },

  /**
   * Reloads childList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId
   * @returns {Promise}
   */
  reloadChildList(entityId) {
    return this.reloadModelList(entityId, 'childList');
  },

  /**
   * Reloads userList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId
   * @returns {Promise}
   */
  reloadUserList(entityId) {
    return this.reloadModelList(entityId, 'userList');
  },

  /**
   * Reloads shared group with given entityId
   * @param {string} entityId
   * @returns {Promise}
   */
  reloadSharedGroup(entityId) {
    const sharedGroups = this.get('store').peekAll('shared-group');
    for (let i = 0; i < get(sharedGroups, 'length'); i++) {
      const sharedGroup = sharedGroups.objectAt(i);
      if (get(sharedGroup, 'entityId') === entityId) {
        return sharedGroup.reload();
      }
    }
    return resolve();
  },

  /**
   * @param {string} parentEntityId 
   * @param {string} childEntityId
   * @returns {Promise}
   */
  removeGroupFromParentGroup(parentEntityId, childEntityId) {
    return leaveRelation(
      this.get('onedataGraph'),
      'group',
      parentEntityId,
      'child',
      childEntityId
    ).then(() =>
      Promise.all([
        this.reloadList(),
        this.get('providerManager').reloadList(),
        this.get('spaceManager').reloadList(),
        this.reloadChildList(parentEntityId).catch(this.ignoreForbidden),
        this.reloadParentList(childEntityId).catch(this.ignoreForbidden),
      ])
    );
  },

  /**
   * @param {string} groupEntityId 
   * @param {string} userEntityId
   * @returns {Promise}
   */
  removeUserFromParentGroup(groupEntityId, userEntityId) {
    const currentUser = this.get('currentUser');
    return leaveRelation(
      this.get('onedataGraph'),
      'group',
      groupEntityId,
      'user',
      userEntityId
    ).then(() =>
      Promise.all([
        this.reloadUserList(groupEntityId).catch(this.ignoreForbidden),
        currentUser.runIfThisUser(userEntityId, () => Promise.all([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
        ])),
      ])
    );
  },

  /**
   * Util function used to ignore `forbidden` errors
   * @param {*} result 
   * @returns {*}
   */
  ignoreForbidden(result) {
    if (result && result.id !== 'forbidden') {
      throw result;
    } else {
      return result;
    }
  },
});
