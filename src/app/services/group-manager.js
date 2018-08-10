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
import gri from 'onedata-gui-websocket-client/utils/gri';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';

export default Service.extend({
  store: service(),
  onedataGraph: service(),
  onedataGraphUtils: service(),
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
      .then(user => user.get('groupList'))
      .then(groupList => groupList.get('list')
        .then(() => groupList)
      );
  },

  /**
   * Returns group with specified id
   * @param {string} id
   * @param {boolean} backgroundReload
   * @return {Promise<Group>} group promise
   */
  getRecord(id, backgroundReload = true) {
    return this.get('store').findRecord('group', id, { backgroundReload });
  },

  /**
   * Creates new group
   * @param {object} group group representation
   * @returns {Promise<Group>}
   */
  createGroup(group) {
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
      .then(destroyResult => {
        return Promise.all([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
        ]).then(() => destroyResult);
      });
  },

  /**
   * Deletes group
   * @param {string} id group id
   * @returns {Promise}
   */
  deleteGroup(id) {
    let group;
    return this.getRecord(id, false)
      .then(g => {
        group = g;
        return group.destroyRecord();
      })
      .then(destroyResult => {
        const entityId = get(group, 'entityId');
        return Promise.all([
          this.updateGroupPresenceInLoadedParents(entityId),
          this.updateGroupPresenceInLoadedChildren(entityId),
          this.updateGroupPresenceInLoadedSpaces(entityId),
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
        ]).then(() => destroyResult);
      });
  },

  /**
   * Joins group to a space using token
   * @param {Group} group 
   * @param {string} token
   * @returns {Promise<Space>}
   */
  joinSpaceAsGroup(group, token) {
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
   * @param {Group} childGroup 
   * @param {string} token
   * @returns {Promise<Group>} parent group
   */
  joinGroupAsGroup(childGroup, token) {
    return childGroup.joinGroup(token)
      .then(parentGroup =>
        Promise.all([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
          this.reloadChildList(get(parentGroup, 'entityId')),
          this.reloadParentList(get(childGroup, 'entityId')),
        ]).then(() => parentGroup)
      );
  },

  /**
   * @param {string} parentEntityId 
   * @param {string} childEntityId
   * @returns {Promise}
   */
  removeGroupFromGroup(parentEntityId, childEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      'group',
      parentEntityId,
      'child',
      childEntityId
    ).then(() =>
      Promise.all([
        this.reloadList(),
        this.get('providerManager').reloadList(),
        this.get('spaceManager').reloadList(),
        this.reloadChildList(parentEntityId).catch(ignoreForbiddenError),
        this.reloadParentList(childEntityId).catch(ignoreForbiddenError),
      ])
    );
  },

  /**
   * @param {string} groupEntityId 
   * @param {string} userEntityId
   * @returns {Promise}
   */
  removeUserFromGroup(groupEntityId, userEntityId) {
    const currentUser = this.get('currentUser');
    return this.get('onedataGraphUtils').leaveRelation(
      'group',
      groupEntityId,
      'user',
      userEntityId
    ).then(() =>
      Promise.all([
        this.reloadUserList(groupEntityId).catch(ignoreForbiddenError),
        currentUser.runIfThisUser(userEntityId, () => Promise.all([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
        ])),
      ])
    );
  },

  /**
   * @param {string} parentEntityId 
   * @param {string} childEntityId
   * @returns {Promise}
   */
  leaveGroupAsGroup(parentEntityId, childEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      'group',
      childEntityId,
      'parent',
      parentEntityId
    ).then(() =>
      Promise.all([
        this.reloadParentList(childEntityId).catch(ignoreForbiddenError),
        this.reloadChildList(parentEntityId).catch(ignoreForbiddenError),
        this.reloadList(),
        this.get('providerManager').reloadList(),
        this.get('spaceManager').reloadList(),
      ])
    );
  },

  /**
   * Creates parent for specified child group
   * @param {string} childEntityId 
   * @param {Object} parentGroupRepresentation
   * @return {Promise}
   */
  createParent(childEntityId, parentGroupRepresentation) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: 'group',
        aspect: 'instance',
      }),
      operation: 'create',
      data: parentGroupRepresentation,
      authHint: ['asGroup', childEntityId],
    }).then(() => {
      return Promise.all([
        this.reloadList(),
        this.reloadParentList(childEntityId).catch(ignoreForbiddenError),
      ]);
    });
  },

  /**
   * Creates child for specified parent group
   * @param {string} parentEntityId 
   * @param {Object} childGroupRepresentation
   * @return {Promise}
   */
  createChild(parentEntityId, childGroupRepresentation) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => this.get('onedataGraph').request({
        gri: gri({
          entityType: 'group',
          entityId: parentEntityId,
          aspect: 'child',
        }),
        operation: 'create',
        data: childGroupRepresentation,
        authHint: ['asUser', get(user, 'entityId')],
      }).then(() => {
        return Promise.all([
          this.reloadList(),
          this.reloadChildList(parentEntityId).catch(ignoreForbiddenError),
        ]);
      }));
  },

  /**
   * Adds group to the children of another group
   * @param {string} groupEntityId 
   * @param {string} futureChildEntityId
   * @return {Promise}
   */
  addChild(groupEntityId, futureChildEntityId) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: 'group',
        entityId: groupEntityId,
        aspect: 'child',
        aspectId: futureChildEntityId,
      }),
      operation: 'create',
    }).then(() => {
      return Promise.all([
        this.reloadList(),
        this.reloadParentList(futureChildEntityId).catch(ignoreForbiddenError),
        this.reloadChildList(groupEntityId).catch(ignoreForbiddenError),
      ]);
    });
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
   * Updates lists in actual (not reloaded) models
   * @param {string} modelType e.g. `space`, `group`
   * @param {string} entityId group entityId
   * @param {string} listName name of list relation in modelType model
   * @returns {Array<Promise>}
   */
  updateGroupPresenceInLoadedModels(modelType, entityId, listName) {
    const models = this.get('store').peekAll(modelType);
    return Promise.all(models.map(model => {
      const list = model.belongsTo(listName).value();
      const ids = list ? list.hasMany('list').ids() : null;
      if (ids && ids.some(id => parseGri(id).entityId === entityId)) {
        return list.reload().then(() => list.hasMany('list').reload());
      } else if (list) {
        // simulate reload to recalculated properties
        list.notifyPropertyChange('isReloading');
      } else {
        return resolve();
      }
    }));
  },

  /**
   * Updates child lists in actual (not reloaded) parents of given group
   * @param {string} entityId group entityId
   * @returns {Array<Promise>}
   */
  updateGroupPresenceInLoadedParents(entityId) {
    return this.updateGroupPresenceInLoadedModels('group', entityId, 'childList');
  },

  /**
   * Updates parent lists in actual (not reloaded) children of given group
   * @param {string} entityId group entityId
   * @returns {Array<Promise>}
   */
  updateGroupPresenceInLoadedChildren(entityId) {
    return this.updateGroupPresenceInLoadedModels('group', entityId, 'parentList');
  },

  /**
   * Updates group lists in actual (not reloaded) spaces
   * @param {string} entityId group entityId
   * @returns {Array<Promise>}
   */
  updateGroupPresenceInLoadedSpaces(entityId) {
    return this.updateGroupPresenceInLoadedModels('space', entityId, 'groupList');
  },

  /**
   * Returns already loaded group by entityId (or undefined if not loaded)
   * @param {string} entityId group entityId
   * @returns {Group|undefined}
   */
  getLoadedGroupByEntityId(entityId) {
    return this.get('store').peekAll('group')
      .filter(g => get(g, 'entityId') === entityId)[0];
  },

  /**
   * Reloads selected list from group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @param {string} listName e.g. `childList`
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
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadParentList(entityId) {
    return this.reloadModelList(entityId, 'parentList');
  },

  /**
   * Reloads childList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadChildList(entityId) {
    return this.reloadModelList(entityId, 'childList');
  },

  /**
   * Reloads userList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadUserList(entityId) {
    return this.reloadModelList(entityId, 'userList');
  },
});
