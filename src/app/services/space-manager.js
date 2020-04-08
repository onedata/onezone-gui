/**
 * Provides data for routes and components associated with spaces tab
 *
 * @module services/space-manager
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get, getProperties } from '@ember/object';
import { Promise, resolve } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { entityType as spaceEntityType } from 'onezone-gui/models/space';

export default Service.extend({
  store: service(),
  currentUser: service(),
  providerManager: service(),
  harvesterManager: service(),
  groupManager: service(),
  onedataGraph: service(),
  onedataGraphUtils: service(),

  /**
   * Fetches collection of all spaces
   * 
   * @return {Promise<DS.RecordArray<Space>>} resolves to an array of providers
   */
  getSpaces() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('spaceList'))
      .then(spaceList => get(spaceList, 'list')
        .then(() => spaceList)
      );
  },

  /**
   * Returns provider with specified id
   * @param {string} id
   * @return {Promise<Provider>} space promise
   */
  getRecord(id) {
    return this.get('store').findRecord('space', id);
  },

  getRecordById(entityId) {
    const recordGri = gri({
      entityType: spaceEntityType,
      entityId: entityId,
      aspect: 'instance',
      scope: 'auto',
    });
    return this.getRecord(recordGri);
  },

  /**
   * Creates new space
   * @returns {Promise<Space>}
   */
  createRecord({ name }) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => {
        return this.get('store').createRecord('space', {
            name,
            _meta: {
              authHint: ['asUser', get(user, 'entityId')],
            },
          })
          .save()
          .then(space => this.reloadList().then(() => space));
      });
  },

  /**
   * Reloads space list
   * @returns {Promise<SpaceList>}
   */
  reloadList() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.belongsTo('spaceList').reload(true))
      .then(spaceList => get(spaceList, 'list'))
      .then(list => list.reload());
  },

  /**
   * Removes user from a space
   * @param {string} entityId
   * @returns {Promise}
   */
  leaveSpace(entityId) {
    const space = this.getLoadedSpaceByEntityId(entityId);
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.leaveSpace(entityId))
      .then(destroyResult => {
        return Promise.all([
          this.reloadList(),
          space ? space.reload().catch(ignoreForbiddenError) : resolve(),
          this.reloadEffUserList(entityId).catch(ignoreForbiddenError),
          this.reloadUserList(entityId).catch(ignoreForbiddenError),
          this.get('providerManager').reloadList(),
        ]).then(() => destroyResult);
      });
  },

  /**
   * Joins user to a space without token
   * @param {string} entityId
   * @returns {Promise}
   */
  joinSpaceAsUser(entityId) {
    const space = this.getLoadedSpaceByEntityId(entityId);
    const {
      currentUser,
      onedataGraph,
    } = this.getProperties('currentUser', 'onedataGraph');
    return currentUser.getCurrentUserRecord()
      .then(user =>
        onedataGraph.request({
          gri: gri({
            entityType: spaceEntityType,
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
        space ? space.reload() : resolve(),
        this.reloadUserList(entityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(entityId).catch(ignoreForbiddenError),
        this.get('providerManager').reloadList(),
      ]));
  },

  /**
   * Creates member group for specified space
   * @param {string} spaceEntityId 
   * @param {Object} childGroupRepresentation
   * @return {Promise}
   */
  createMemberGroup(spaceEntityId, childGroupRepresentation) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => this.get('onedataGraph').request({
        gri: gri({
          entityType: spaceEntityType,
          entityId: spaceEntityId,
          aspect: 'group',
          scope: 'auto',
        }),
        operation: 'create',
        data: childGroupRepresentation,
        authHint: ['asUser', get(user, 'entityId')],
      }).then(() => {
        return Promise.all([
          this.reloadGroupList(spaceEntityId).catch(ignoreForbiddenError),
          this.reloadEffGroupList(spaceEntityId).catch(ignoreForbiddenError),
          this.get('groupManager').reloadList(),
        ]);
      }));
  },

  /**
   * Adds group to the members of a space
   * @param {string} spaceEntityId 
   * @param {string} groupEntityId
   * @return {Promise}
   */
  addMemberGroup(spaceEntityId, groupEntityId) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: spaceEntityType,
        entityId: spaceEntityId,
        aspect: 'group',
        aspectId: groupEntityId,
        scope: 'auto',
      }),
      operation: 'create',
    }).then(() => {
      return Promise.all([
        this.reloadGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadEffGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.get('groupManager').reloadSpaceList(groupEntityId)
        .catch(ignoreForbiddenError),
      ]);
    });
  },

  /**
   * @param {string} spaceEntityId 
   * @param {string} userEntityId
   * @returns {Promise}
   */
  removeUserFromSpace(spaceEntityId, userEntityId) {
    const currentUser = this.get('currentUser');
    const space = this.getLoadedSpaceByEntityId(spaceEntityId);
    return this.get('onedataGraphUtils').leaveRelation(
      spaceEntityType,
      spaceEntityId,
      'user',
      userEntityId
    ).then(() =>
      Promise.all([
        this.reloadUserList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(spaceEntityId).catch(ignoreForbiddenError),
        currentUser.runIfThisUser(userEntityId, () => Promise.all([
          this.reloadList(),
          this.get('providerManager').reloadList(),
          space ? space.reload().catch(ignoreForbiddenError) : resolve(),
        ])),
      ])
    );
  },

  /**
   * @param {string} spaceEntityId 
   * @param {string} groupEntityId
   * @returns {Promise}
   */
  leaveSpaceAsGroup(spaceEntityId, groupEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      'group',
      groupEntityId,
      spaceEntityType,
      spaceEntityId
    ).then(() =>
      Promise.all([
        this.reloadGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadList(),
        this.get('providerManager').reloadList(),
        this.get('groupManager').reloadSpaceList(groupEntityId)
        .catch(ignoreForbiddenError),
      ])
    );
  },

  /**
   * @param {string} spaceEntityId 
   * @param {string} groupEntityId
   * @returns {Promise}
   */
  removeGroupFromSpace(spaceEntityId, groupEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      spaceEntityType,
      spaceEntityId,
      'group',
      groupEntityId
    ).then(() =>
      Promise.all([
        this.reloadGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadEffGroupList(spaceEntityId).catch(ignoreForbiddenError),
        this.reloadList(),
        this.get('providerManager').reloadList(),
        this.get('groupManager').reloadSpaceList(groupEntityId)
        .catch(ignoreForbiddenError),
      ])
    );
  },

  /**
   * Joins space to a harvester using token
   * @param {Model.Space} space 
   * @param {string} token
   * @returns {Promise<Model.Harvester>}
   */
  joinSpaceToHarvester(space, token) {
    const harvesterManager = this.get('harvesterManager');
    return space.joinHarvester(token)
      .then(harvester => harvesterManager.reloadSpaceList(get(harvester, 'entityId'))
        .catch(ignoreForbiddenError)
        .then(() => space)
      );
  },

  /**
   * Returns already loaded space by entityId (or undefined if not loaded)
   * @param {string} entityId space entityId
   * @returns {Space|undefined}
   */
  getLoadedSpaceByEntityId(entityId) {
    return this.get('store').peekAll('space').findBy('entityId', entityId);
  },

  /**
   * Reloads selected list from space identified by entityId.
   * @param {string} entityId space entityId
   * @param {string} listName e.g. `childList`
   * @returns {Promise}
   */
  reloadModelList(entityId, listName) {
    const space = this.getLoadedSpaceByEntityId(entityId);
    return space ? space.reloadList(listName) : resolve();
  },

  /**
   * Reloads groupList of space identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadGroupList(entityId) {
    return this.reloadModelList(entityId, 'groupList');
  },

  /**
   * Reloads effGroupList of space identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadEffGroupList(entityId) {
    return this.reloadModelList(entityId, 'effGroupList');
  },

  /**
   * Reloads userList of space identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadUserList(entityId) {
    return this.reloadModelList(entityId, 'userList');
  },

  /**
   * Reloads effUserList of space identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadEffUserList(entityId) {
    return this.reloadModelList(entityId, 'effUserList');
  },

  ceaseOneproviderSupport(space, provider) {
    const {
      entityType,
      entityId,
    } = getProperties(space, 'entityType', 'entityId');
    const aspectId = get(provider, 'entityId');
    const ceaseGri = gri({
      entityType,
      entityId,
      aspect: 'provider',
      aspectId,
    });
    return this.get('onedataGraph').request({
        operation: 'delete',
        gri: ceaseGri,
        scope: 'private',
      })
      .then(() => space.belongsTo('providerList').reload())
      .finally(() => this.get('currentUser').getCurrentUserRecord()
        .then(user => {
          return user.belongsTo('providerList').reload()
            .then(userProviderList => {
              const providerStillPresent = userProviderList
                .hasMany('list').ids().includes(get(provider, 'id'));
              if (providerStillPresent) {
                return provider.belongsTo('spaceList').reload();
              }
            });
        })
      );
  },
});
