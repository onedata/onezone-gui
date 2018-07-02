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

export default Service.extend({
  store: service(),
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
      .then(user => user.leaveGroup(entityId));
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
      .then(destroyResult =>
        Promise.all([
          ...this.updateRelatedGroups(group),
          this.reloadList(),
        ]).then(() => destroyResult)
      );
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
   * Updates group lists in parents of given group
   * @param {Group} group 
   * @returns {Array<Promise>}
   */
  updateRelatedGroups(group) {
    const entityId = get(group, 'entityId');
    const groups = this.get('store').peekAll('group');

    return groups.map(g => {
      let parentChildList = g.belongsTo('childList').value();
      parentChildList = parentChildList ?
        parentChildList.hasMany('list').value() : null;
      if (parentChildList &&
        parentChildList.map(c => get(c, 'entityId')).includes(entityId)) {
        return g.belongsTo('childList').value().reload();
      } else {
        return resolve();
      }
    });
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
});
