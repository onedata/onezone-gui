/**
 * A members aspect of group.
 *
 * @module components/content-clusters-members
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { groupedFlags } from 'onedata-gui-websocket-client/utils/cluster-privileges-flags';
import { inject as service } from '@ember/service';
import GlobalActions from 'onedata-gui-common/mixins/components/global-actions';
import MembersAspectBase from 'onezone-gui/mixins/members-aspect-base';
import layout from 'onezone-gui/templates/components/-members-aspect-base';
import { Promise } from 'rsvp';

export default Component.extend(I18n, GlobalActions, MembersAspectBase, {
  layout,
  classNames: ['members-aspect-base', 'content-clusters-members'],

  i18n: service(),
  navigationState: service(),
  clusterActions: service(),
  clusterManager: service(),
  globalNotify: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentClustersMembers',

  /**
   * @override
   */
  groupedPrivilegesFlags: groupedFlags,

  /**
   * @override
   */
  modelType: 'cluster',

  /**
   * @override
   */
  record: reads('cluster'),

  /**
   * @override
   */
  removeMember(type, member) {
    const {
      clusterActions,
      cluster,
    } = this.getProperties(
      'clusterActions',
      'cluster',
    );
    return type === 'group' ?
      clusterActions.removeMemberGroupFromCluster(cluster, member) :
      clusterActions.removeMemberUserFromCluster(cluster, member);
  },

  /**
   * @override
   */
  removeMembers(members) {
    const {
      clusterManager,
      globalNotify,
      cluster,
    } = this.getProperties(
      'clusterManager',
      'globalNotify',
      'cluster'
    );

    const clusterEntityId = get(cluster, 'entityId');
    const promise = Promise.all(members.map(member => {
      const memberEntityId = get(member, 'entityId');
      if (get(member, 'entityType') === 'user') {
        return clusterManager.removeMemberUserFromCluster(
          clusterEntityId,
          memberEntityId
        );
      } else {
        return clusterManager.removeMemberGroupFromCluster(
          clusterEntityId,
          memberEntityId
        );
      }
    }));
    return promise.then(() => {
      globalNotify.success(this.t('removeMembersSuccess'));
    }).catch(error => {
      globalNotify.backendError(this.t('deletingMember'), error);
      throw error;
    });
  },

  /**
   * @override
   */
  createChildGroup(name) {
    const {
      clusterActions,
      cluster,
    } = this.getProperties('clusterActions', 'cluster');
    return clusterActions.createMemberGroupForCluster(cluster, { name });
  },

  /**
   * @override
   */
  addMemberGroup(group) {
    const {
      clusterActions,
      cluster,
    } = this.getProperties('clusterActions', 'cluster');
    return clusterActions.addMemberGroupToCluster(cluster, group);
  },

  /**
   * @override
   */
  join() {
    const {
      clusterActions,
      cluster,
    } = this.getProperties('clusterActions', 'cluster');
    return clusterActions.joinClusterAsUser(cluster);
  },
});
