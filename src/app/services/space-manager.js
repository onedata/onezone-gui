/**
 * Provides data for routes and components assoctiated with spaces tab
 *
 * @module services/space-manager
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject } from '@ember/service';
import { get } from '@ember/object';
import { Promise, resolve } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import gri from 'onedata-gui-websocket-client/utils/gri';

export default Service.extend({
  store: inject(),
  currentUser: inject(),
  providerManager: inject(),
  groupManager: inject(),
  onedataGraph: inject(),
  onedataGraphUtils: inject(),

  /**
   * Fetches collection of all spaces
   * 
   * @return {Promise<DS.RecordArray<Space>>} resolves to an array of providers
   */
  getSpaces() {
    return this.get('currentUser')
      .getCurrentUserRecord()
      .then(user => user.get('spaceList'));
  },

  /**
   * Returns provider with specified id
   * @param {string} id
   * @return {Promise<Provider>} space promise
   */
  getRecord(id) {
    return this.get('store').findRecord('space', id);
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
      .then(user => user.belongsTo('spaceList').reload(true));
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
            entityType: 'space',
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
          entityType: 'space',
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
        entityType: 'space',
        entityId: spaceEntityId,
        aspect: 'group',
        aspectId: groupEntityId,
        scope: 'auto',
      }),
      operation: 'create',
    }).then(() => {
      return Promise.all([
        this.reloadGroupList(spaceEntityId).catch(ignoreForbiddenError),
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
      'space',
      spaceEntityId,
      'user',
      userEntityId
    ).then(() =>
      Promise.all([
        this.reloadUserList(spaceEntityId).catch(ignoreForbiddenError),
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
  removeGroupFromSpace(spaceEntityId, groupEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      'space',
      spaceEntityId,
      'group',
      groupEntityId
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
   * Reloads userList of space identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId group entityId
   * @returns {Promise}
   */
  reloadUserList(entityId) {
    return this.reloadModelList(entityId, 'userList');
  },
});
