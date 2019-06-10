/**
 * Provides data for routes and components associated with groups tab.
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
  clusterManager: service(),
  providerManager: service(),
  harvesterManager: service(),

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
          this.reloadUserList(get(group, 'entityId')).catch(ignoreForbiddenError),
          this.reloadEffUserList(get(group, 'entityId')).catch(ignoreForbiddenError),
        ]).then(() => group))
      );
  },

  /**
   * Joins user to a group without token
   * @param {string} entityId
   * @returns {Promise}
   */
  joinGroupAsUser(entityId) {
    const group = this.getLoadedGroupByEntityId(entityId);
    const {
      currentUser,
      onedataGraph,
    } = this.getProperties('currentUser', 'onedataGraph');
    return currentUser.getCurrentUserRecord()
      .then(user =>
        onedataGraph.request({
          gri: gri({
            entityType: 'group',
            entityId,
            aspect: 'user',
            aspectId: get(user, 'entityId'),
            scope: 'private',
          }),
          operation: 'create',
          subscribe: false,
        })
      )
      .then(() => Promise.all([
        group ? group.reload() : resolve(),
        this.reloadUserList(entityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(entityId).catch(ignoreForbiddenError),
      ]));
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
    const group = this.getLoadedGroupByEntityId(entityId);
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.leaveGroup(entityId))
      .then(destroyResult => {
        return Promise.all([
          this.reloadList(),
          group ? group.reload().catch(ignoreForbiddenError) : resolve(),
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
        return Promise.all([
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
    const {
      providerManager,
      spaceManager,
    } = this.getProperties('providerManager', 'spaceManager');
    return group.joinSpace(token)
      .then(space =>
        Promise.all([
          this.reloadSpaceList(get(group, 'entityId')).catch(ignoreForbiddenError),
          providerManager.reloadList(),
          spaceManager.reloadList(),
          spaceManager.reloadGroupList(get(space, 'entityId'))
          .catch(ignoreForbiddenError),
        ]).then(() => space)
      );
  },

  /**
   * Joins group to a harvester using token
   * @param {Model.Group} group 
   * @param {string} token
   * @returns {Promise<Harvester>}
   */
  joinHarvesterAsGroup(group, token) {
    const harvesterManager = this.get('harvesterManager');
    return group.joinHarvester(token)
      .then(harvester => {
        const harvesterEntityId = get(harvester, 'entityId');
        return Promise.all([
          harvesterManager.reloadGroupList(harvesterEntityId)
          .catch(ignoreForbiddenError),
          harvesterManager.reloadEffGroupList(harvesterEntityId)
          .catch(ignoreForbiddenError),
        ]).then(() => harvester);
      });
  },

  /**
   * Joins group as a subgroup
   * @param {Group} childGroup 
   * @param {string} token
   * @returns {Promise<Group>} parent group
   */
  joinGroupAsGroup(childGroup, token) {
    const childEntityId = get(childGroup, 'entityId');
    return childGroup.joinGroup(token)
      .then(parentGroup =>
        Promise.all([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          this.get('spaceManager').reloadList(),
          this.reloadChildList(get(parentGroup, 'entityId'))
          .catch(ignoreForbiddenError),
          this.reloadEffChildList(get(parentGroup, 'entityId'))
          .catch(ignoreForbiddenError),
          this.reloadParentList(childEntityId).catch(ignoreForbiddenError),
          this.reloadSpaceList(childEntityId).catch(ignoreForbiddenError),
        ]).then(() => parentGroup)
      );
  },

  /**
   * Joins group to a cluster using token
   * @param {Group} group 
   * @param {string} token
   * @returns {Promise<Cluster>}
   */
  joinClusterAsGroup(group, token) {
    const clusterManager = this.get('clusterManager');
    return group.joinCluster(token)
      .then(cluster => {
        const clusterEntityId = get(cluster, 'entityId');
        return Promise.all([
          clusterManager.reloadList(),
          clusterManager.reloadGroupList(clusterEntityId)
          .catch(ignoreForbiddenError),
          clusterManager.reloadEffGroupList(clusterEntityId)
          .catch(ignoreForbiddenError),
        ]).then(() => cluster);
      });
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
        this.reloadEffChildList(parentEntityId).catch(ignoreForbiddenError),
        this.reloadParentList(childEntityId).catch(ignoreForbiddenError),
        this.reloadSpaceList(childEntityId).catch(ignoreForbiddenError),
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
    const group = this.getLoadedGroupByEntityId(groupEntityId);
    return this.get('onedataGraphUtils').leaveRelation(
      'group',
      groupEntityId,
      'user',
      userEntityId
    ).then(() =>
      Promise.all([
        this.reloadUserList(groupEntityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(groupEntityId).catch(ignoreForbiddenError),
        currentUser.runIfThisUser(userEntityId, () => Promise.all([
          group ? group.reload().catch(ignoreForbiddenError) : resolve(),
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
        this.reloadSpaceList(childEntityId).catch(ignoreForbiddenError),
        this.reloadChildList(parentEntityId).catch(ignoreForbiddenError),
        this.reloadEffChildList(parentEntityId).catch(ignoreForbiddenError),
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
          scope: 'auto',
        }),
        operation: 'create',
        data: childGroupRepresentation,
        authHint: ['asUser', get(user, 'entityId')],
      }).then(() => {
        return Promise.all([
          this.reloadList(),
          this.reloadChildList(parentEntityId).catch(ignoreForbiddenError),
          this.reloadEffChildList(parentEntityId).catch(ignoreForbiddenError),
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
        scope: 'auto',
      }),
      operation: 'create',
    }).then(() => {
      return Promise.all([
        this.reloadList(),
        this.reloadParentList(futureChildEntityId).catch(ignoreForbiddenError),
        this.reloadSpaceList(futureChildEntityId).catch(ignoreForbiddenError),
        this.reloadChildList(groupEntityId).catch(ignoreForbiddenError),
        this.reloadEffChildList(groupEntityId).catch(ignoreForbiddenError),
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
   * Returns already loaded group by entityId (or undefined if not loaded)
   * @param {string} entityId group entityId
   * @returns {Group|undefined}
   */
  getLoadedGroupByEntityId(entityId) {
    return this.get('store').peekAll('group').findBy('entityId', entityId);
  },

  /**
   * Reloads selected list from group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @param {string} listName e.g. `childList`
   * @returns {Promise}
   */
  reloadRecordList(entityId, listName) {
    const group = this.getLoadedGroupByEntityId(entityId);
    return group ? group.reloadList(listName) : resolve();
  },

  /**
   * Reloads parentList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadParentList(entityId) {
    return this.reloadRecordList(entityId, 'parentList');
  },

  /**
   * Reloads childList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadChildList(entityId) {
    return this.reloadRecordList(entityId, 'childList');
  },

  /**
   * Reloads effChildList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadEffChildList(entityId) {
    return this.reloadRecordList(entityId, 'effChildList');
  },

  /**
   * Reloads userList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadUserList(entityId) {
    return this.reloadRecordList(entityId, 'userList');
  },

  /**
   * Reloads effUserList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadEffUserList(entityId) {
    return this.reloadRecordList(entityId, 'effUserList');
  },

  /**
   * Reloads spaceList of group identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadSpaceList(entityId) {
    return this.reloadRecordList(entityId, 'spaceList');
  },
});
