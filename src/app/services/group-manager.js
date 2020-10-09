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
import { computed, get, getProperties, observer } from '@ember/object';
import _ from 'lodash';
import { Promise, resolve, reject, all as allFulfilled } from 'rsvp';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import gri from 'onedata-gui-websocket-client/utils/gri';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import { entityType as groupEntityType } from 'onezone-gui/models/group';
import { promiseArray } from 'onedata-gui-common/utils/ember/promise-array';
import { promise } from 'ember-awesome-macros';
import onlyFulfilledValues from 'onedata-gui-common/utils/only-fulfilled-values';
import ArrayProxy from '@ember/array/proxy';

export default Service.extend({
  store: service(),
  onedataGraph: service(),
  onedataGraphUtils: service(),
  currentUser: service(),
  spaceManager: service(),
  clusterManager: service(),
  providerManager: service(),
  harvesterManager: service(),
  recordManager: service(),

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

  getRecordById(entityId) {
    const recordGri = gri({
      entityType: groupEntityType,
      entityId: entityId,
      aspect: 'instance',
      scope: 'auto',
    });
    return this.getRecord(recordGri);
  },

  /**
   * @returns {PromiseArray<Models.User>}
   */
  getAllKnownGroups() {
    const knownGroupsProxy = AllKnownGroupsProxyArray.create({
      recordManager: this.get('recordManager'),
    });
    return promiseArray(
      get(knownGroupsProxy, 'allGroupsProxy').then(() => knownGroupsProxy)
    );
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
            entityType: groupEntityType,
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
   * @param {string} parentEntityId 
   * @param {string} childEntityId
   * @returns {Promise}
   */
  removeGroupFromGroup(parentEntityId, childEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      groupEntityType,
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
      groupEntityType,
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
      groupEntityType,
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
        entityType: groupEntityType,
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
          entityType: groupEntityType,
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
        entityType: groupEntityType,
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

const AllKnownGroupsProxyArray = ArrayProxy.extend({
  /**
   * @type {Service}
   * @virtual
   */
  recordManager: undefined,

  /**
   * @type {ComputedProperty<PromiseArray<Models.Group>>}
   */
  allGroupsProxy: promise.array(computed(
    'groupsProxy',
    'groupsGroupsListsProxy.[]',
    'spacesGroupsListsProxy.[]',
    function allGroupsProxy() {
      const {
        groupsProxy,
        groupsGroupsListsProxy,
        spacesGroupsListsProxy,
      } = this.getProperties(
        'groupsProxy',
        'groupsGroupsListsProxy',
        'spacesGroupsListsProxy'
      );
      const groupsArray = [];
      return allFulfilled([
        groupsProxy,
        groupsGroupsListsProxy,
        spacesGroupsListsProxy,
      ]).then(([
        userGroups,
        groupsGroupsLists,
        spacesGroupsLists,
      ]) => {
        groupsArray.push(...userGroups.toArray());
        groupsGroupsLists
          .concat(spacesGroupsLists)
          .forEach(groupsList =>
            groupsArray.push(...groupsList.toArray())
          );
        return groupsArray.uniqBy('entityId');
      });
    }
  )),

  allGroupsProxyObserver: observer(
    'allGroupsProxy.[]',
    function allGroupsProxyObserver() {
      const {
        isFulfilled,
        content,
      } = getProperties(this.get('allGroupsProxy'), 'isFulfilled', 'content');

      if (isFulfilled) {
        this.set('content', content);
      }
    }
  ),

  init() {
    this._super(...arguments);

    const toSet = {};
    ['group', 'space'].forEach(modelName => {
      toSet[`${modelName}sProxy`] = promise.array(computed(function proxy() {
        return this.get('recordManager').getUserRecordList(modelName)
          .then(recordList => get(recordList, 'list'));
      }));
      toSet[`${modelName}sGroupsListsProxy`] = computed(
        `${modelName}sProxy.@each.isReloading`,
        function computedLists() {
          return this.get(`${modelName}sProxy`)
            .then(parents => onlyFulfilledValues(parents.mapBy('effGroupList')))
            .then(effLists => onlyFulfilledValues(effLists.mapBy('list')));
        }
      );
    });

    this.setProperties(toSet);
  },
});
