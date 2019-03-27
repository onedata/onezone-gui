import ClusterActions from 'onedata-gui-common/services/cluster-actions';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';

export default ClusterActions.extend({
  clusterManager: service(),
  globalNotify: service(),
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
   * Joins to existing cluster using token
   * @param {string} token
   * @returns {Promise} A promise, which resolves to cluster if it has
   * been joined successfully.
   */
  joinCluster(token) {
    return this.get('clusterManager').joinCluster(token)
      .then(cluster => {
        this.get('globalNotify').info(this.t('joinedClusterSuccess'));
        this.redirectToCluster(cluster);
        return cluster;
      })
      .catch(error => {
        this.get('globalNotify').backendError(this.t('joiningCluster'), error);
        throw error;
      });
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
    return clusterManager.removeMemberGroupFromCluster(
      get(cluster, 'entityId'),
      get(group, 'entityId')
    ).then(() => {
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
    } = this.getProperties('clusterManager', 'globalNotify');
    return clusterManager.removeMemberUserFromCluster(
      get(cluster, 'entityId'),
      get(user, 'entityId')
    ).then(() => {
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
