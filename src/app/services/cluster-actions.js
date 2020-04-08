/**
 * A service which provides clusters manipulation functions ready to use for gui
 *
 * @module services/cluster-actions
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ClusterActions from 'onedata-gui-common/services/cluster-actions';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default ClusterActions.extend({
  clusterManager: service(),
  globalNotify: service(),
  currentUser: service(),
  guiUtils: service(),

  /**
   * Redirects to cluster page
   * @param {Cluster} cluster
   * @param {string} aspect
   * @returns {Promise}
   */
  redirectToCluster(cluster, aspect = 'overview') {
    const {
      router,
      guiUtils,
    } = this.getProperties('router', 'guiUtils');
    return router.transitionTo(
      'onedata.sidebar.content.aspect',
      'clusters',
      guiUtils.getRoutableIdFor(cluster),
      aspect,
    );
  },

  /**
   * Creates member group for specified cluster
   * @param {Models.Cluster} cluster 
   * @param {Object} groupRepresentation
   * @return {Promise}
   */
  createMemberGroupForCluster(cluster, groupRepresentation) {
    const {
      clusterManager,
      globalNotify,
    } = this.getProperties('clusterManager', 'globalNotify');
    return clusterManager
      .createMemberGroupForCluster(get(cluster, 'entityId'), groupRepresentation)
      .then(() => {
        globalNotify.success(this.t('createMemberGroupSuccess', {
          memberGroupName: get(groupRepresentation, 'name'),
        }));
      }).catch(error => {
        globalNotify.backendError(this.t('creatingMemberGroup'), error);
        throw error;
      });
  },

  /**
   * Adds existing group to cluster
   * @param {Models.Cluster} cluster 
   * @param {Models.Group} group
   * @return {Promise}
   */
  addMemberGroupToCluster(cluster, group) {
    const {
      clusterManager,
      globalNotify,
    } = this.getProperties('clusterManager', 'globalNotify');
    return clusterManager.addMemberGroupToCluster(
      get(cluster, 'entityId'),
      get(group, 'entityId')
    ).then(() => {
      globalNotify.success(this.t('addMemberGroupSuccess', {
        memberGroupName: get(group, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('addingMemberGroup'), error);
      throw error;
    });
  },

  /**
   * Removes group from cluster
   * @param {Models.Cluster} cluster 
   * @param {Models.Group} group
   * @returns {Promise}
   */
  removeMemberGroupFromCluster(cluster, group) {
    const {
      clusterManager,
      globalNotify,
    } = this.getProperties('clusterManager', 'globalNotify');
    const clusterEntityId = get(cluster, 'entityId');
    const groupEntityId = get(group, 'entityId');
    return clusterManager.removeMemberGroupFromCluster(
      get(cluster, 'entityId'),
      get(group, 'entityId')
    ).catch(error => {
      return clusterManager.leaveClusterAsGroup(clusterEntityId, groupEntityId)
        .catch(error2 => {
          if (get(error2 || {}, 'id') !== 'forbidden') {
            console.error(error);
            throw error2;
          } else {
            throw error;
          }
        });
    }).then(() => {
      globalNotify.success(this.t('removeGroupSuccess', {
        clusterName: get(cluster, 'name'),
        groupName: get(group, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('removingGroup'), error);
      throw error;
    });
  },

  /**
   * Removes user from cluster
   * @param {Models.Cluster} cluster 
   * @param {Models.User} user
   * @returns {Promise}
   */
  removeMemberUserFromCluster(cluster, user) {
    const {
      clusterManager,
      globalNotify,
      currentUser,
    } = this.getProperties('clusterManager', 'globalNotify', 'currentUser');
    const clusterEntityId = get(cluster, 'entityId');
    const userEntityId = get(user, 'entityId');
    return clusterManager.removeMemberUserFromCluster(
      clusterEntityId,
      userEntityId
    ).catch(error => {
      if (get(currentUser, 'userId') === userEntityId) {
        return clusterManager.leaveCluster(clusterEntityId).catch(error2 => {
          if (get(error2 || {}, 'id') !== 'forbidden') {
            console.error(error);
            throw error2;
          } else {
            throw error;
          }
        });
      } else {
        throw error;
      }
    }).then(() => {
      globalNotify.success(this.t('removeUserSuccess', {
        clusterName: get(cluster, 'name'),
        userName: get(user, 'name'),
      }));
    }).catch(error => {
      globalNotify.backendError(this.t('removingUser'), error);
      throw error;
    });
  },

  /**
   * Joins user to an existing cluster (without token)
   * @param {Models.Cluster} cluster
   * @returns {Promise} A promise, which resolves to cluster if it has
   * been joined successfully.
   */
  joinClusterAsUser(cluster) {
    return this.get('clusterManager').joinClusterAsUser(get(cluster, 'entityId'))
      .then(clusterRecord => {
        this.get('globalNotify').info(this.t('joinedClusterSuccess'));
        return clusterRecord;
      })
      .catch(error => {
        this.get('globalNotify').backendError(this.t('joiningCluster'), error);
        throw error;
      });
  },
});
