/**
 * Provides data and operations for routes and components associated with clusters tab.
 *
 * @module services/cluster-manager
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get } from '@ember/object';
import gri from 'onedata-gui-websocket-client/utils/gri';
import { Promise, resolve, all as allFulfilled } from 'rsvp';
import ignoreForbiddenError from 'onedata-gui-common/utils/ignore-forbidden-error';
import { entityType as clusterEntityType } from 'onezone-gui/models/cluster';

function loadClusterRecord(cluster) {
  return cluster.loadAsyncProperties().then(() => cluster);
}

export default Service.extend({
  currentUser: service(),
  store: service(),
  onedataGraph: service(),
  onedataGraphUtils: service(),
  tokenManager: service(),

  getClusters() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => get(user, 'clusterList'))
      .then(clusterList => get(clusterList, 'list')
        .then(list => allFulfilled(list.map(cluster => cluster.getNameProxy())))
        .then(() => clusterList)
      );
  },

  getRecord(id) {
    return this.get('store').findRecord('cluster', id)
      .then(cluster => loadClusterRecord(cluster));
  },

  getRecordById(entityId) {
    const recordGri = gri({
      entityType: clusterEntityType,
      entityId: entityId,
      aspect: 'instance',
      scope: 'auto',
    });
    return this.getRecord(recordGri);
  },

  /**
   * Reloads clusters list
   * @returns {Promise<Models.ClusterList>}
   */
  reloadList() {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.belongsTo('clusterList').reload(true));
  },

  /**
   * Get token that allows to register Oneprovider in Onezone.
   * We get resource called `provider_registration_token`.
   * @returns {Promise<string>} resolves the token
   */
  getOnezoneRegistrationToken() {
    const {
      onedataGraph,
      tokenManager,
    } = this.getProperties('onedataGraph', 'tokenManager');
    const userId = this.get('currentUser.userId');
    return onedataGraph.request({
      gri: gri({
        entityType: 'user',
        entityId: 'self',
        aspect: 'provider_registration_token',
      }),
      operation: 'create',
      data: { userId },
      subscribe: false,
    }).then(result => {
      tokenManager.reloadList();
      return result;
    });
  },

  /**
   * Creates member group for specified cluster
   * @param {string} clusterEntityId
   * @param {Object} groupRepresentation
   * @returns {Promise}
   */
  createMemberGroupForCluster(clusterEntityId, groupRepresentation) {
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => this.get('onedataGraph').request({
        gri: gri({
          entityType: clusterEntityType,
          entityId: clusterEntityId,
          aspect: 'group',
          scope: 'auto',
        }),
        operation: 'create',
        data: groupRepresentation,
        authHint: ['asUser', get(user, 'entityId')],
      }).then(() => Promise.all([
        this.reloadGroupList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadEffGroupList(clusterEntityId).catch(ignoreForbiddenError),
      ])));
  },

  /**
   * Adds group to the members of a cluster
   * @param {string} clusterEntityId
   * @param {string} groupEntityId
   * @returns {Promise}
   */
  addMemberGroupToCluster(clusterEntityId, groupEntityId) {
    return this.get('onedataGraph').request({
      gri: gri({
        entityType: clusterEntityType,
        entityId: clusterEntityId,
        aspect: 'group',
        aspectId: groupEntityId,
        scope: 'auto',
      }),
      operation: 'create',
    }).then(() => Promise.all([
      this.reloadEffUserList(clusterEntityId).catch(ignoreForbiddenError),
      this.reloadGroupList(clusterEntityId).catch(ignoreForbiddenError),
      this.reloadEffGroupList(clusterEntityId).catch(ignoreForbiddenError),
    ]));
  },

  /**
   * Joins user to a cluster without token
   * @param {string} clusterEntityId
   * @returns {Promise}
   */
  joinClusterAsUser(clusterEntityId) {
    const cluster = this.getLoadedClusterByEntityId(clusterEntityId);
    const {
      currentUser,
      onedataGraph,
    } = this.getProperties('currentUser', 'onedataGraph');
    return currentUser.getCurrentUserRecord()
      .then(user =>
        onedataGraph.request({
          gri: gri({
            entityType: clusterEntityType,
            entityId: clusterEntityId,
            aspect: 'user',
            aspectId: get(user, 'entityId'),
            scope: 'private',
          }),
          operation: 'create',
          subscribe: false,
        })
      )
      .then(() => Promise.all([
        cluster ? cluster.reload() : resolve(),
        this.reloadUserList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(clusterEntityId).catch(ignoreForbiddenError),
      ]));
  },

  leaveCluster(clusterEntityId) {
    const cluster = this.getLoadedClusterByEntityId(clusterEntityId);
    return this.get('currentUser').getCurrentUserRecord()
      .then(user => user.leaveCluster(clusterEntityId))
      .then(() =>
        Promise.all([
          this.reloadUserList(clusterEntityId).catch(ignoreForbiddenError),
          this.reloadEffUserList(clusterEntityId).catch(ignoreForbiddenError),
          this.reloadList(),
          cluster ? cluster.reload().catch(ignoreForbiddenError) : resolve(),
        ])
      );
  },

  /**
   * @param {string} clusterEntityId
   * @param {string} userEntityId
   * @returns {Promise}
   */
  removeMemberUserFromCluster(clusterEntityId, userEntityId) {
    const currentUser = this.get('currentUser');
    const cluster = this.getLoadedClusterByEntityId(clusterEntityId);
    return this.get('onedataGraphUtils').leaveRelation(
      clusterEntityType,
      clusterEntityId,
      'user',
      userEntityId
    ).then(() =>
      Promise.all([
        this.reloadUserList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(clusterEntityId).catch(ignoreForbiddenError),
        currentUser.runIfThisUser(userEntityId, () => Promise.all([
          this.reloadList(),
          cluster ? cluster.reload().catch(ignoreForbiddenError) : resolve(),
        ])),
      ])
    );
  },

  /**
   * @param {string} clusterEntityId
   * @param {string} groupEntityId
   * @returns {Promise}
   */
  leaveClusterAsGroup(clusterEntityId, groupEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      'group',
      groupEntityId,
      clusterEntityType,
      clusterEntityId
    ).then(() =>
      Promise.all([
        this.reloadGroupList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadEffGroupList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadUserList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadList(),
      ])
    );
  },

  /**
   * @param {string} clusterEntityId
   * @param {string} groupEntityId
   * @returns {Promise}
   */
  removeMemberGroupFromCluster(clusterEntityId, groupEntityId) {
    return this.get('onedataGraphUtils').leaveRelation(
      clusterEntityType,
      clusterEntityId,
      'group',
      groupEntityId
    ).then(() =>
      Promise.all([
        this.reloadGroupList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadEffGroupList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadUserList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadEffUserList(clusterEntityId).catch(ignoreForbiddenError),
        this.reloadList(),
      ])
    );
  },

  /**
   * Returns already loaded cluster by entityId (or undefined if not loaded)
   * @param {string} entityId cluster entityId
   * @returns {Models.Cluster|undefined}
   */
  getLoadedClusterByEntityId(entityId) {
    return this.get('store').peekAll('cluster').findBy('entityId', entityId);
  },

  /**
   * Reloads selected list from cluster identified by entityId.
   * @param {string} entityId cluster entityId
   * @param {string} listName e.g. `childList`
   * @returns {Promise}
   */
  reloadModelList(entityId, listName) {
    const cluster = this.getLoadedClusterByEntityId(entityId);
    return cluster ? cluster.reloadList(listName) : resolve();
  },

  /**
   * Reloads groupList of cluster identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId cluster entityId
   * @returns {Promise}
   */
  reloadGroupList(entityId) {
    return this.reloadModelList(entityId, 'groupList');
  },

  /**
   * Reloads effGroupList of cluster identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId cluster entityId
   * @returns {Promise}
   */
  reloadEffGroupList(entityId) {
    return this.reloadModelList(entityId, 'effGroupList');
  },

  /**
   * Reloads userList of cluster identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId cluster entityId
   * @returns {Promise}
   */
  reloadUserList(entityId) {
    return this.reloadModelList(entityId, 'userList');
  },

  /**
   * Reloads effUserList of cluster identified by entityId. If list has not been
   * fetched, nothing is reloaded
   * @param {string} entityId cluster entityId
   * @returns {Promise}
   */
  reloadEffUserList(entityId) {
    return this.reloadModelList(entityId, 'effUserList');
  },

  /**
   * Deregisters Oneprovider cluster from Onezone
   * @param {models/Cluster} cluster cluster which must be "oneprovider" type
   * @returns {Promise<models/ClusterList>}
   */
  deregisterOneproviderCluster(cluster) {
    return get(cluster, 'provider')
      .then(provider => provider.destroyRecord())
      .then(() => this.getClusters())
      .then(clusterList => clusterList.reload());
  },
});
