/**
 * View where some Oneprovider can be deregistered from Onezone
 * 
 * @module components/content-clusters-deregister
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { reject } from 'rsvp';
import oneproviderClusterResourceStats from 'onezone-gui/utils/oneprovider-cluster-resource-stats';
import { dateFormat } from 'onedata-gui-common/helpers/date-format';

export default Component.extend(
  I18n,
  createDataProxyMixin('stats'), {
    classNames: ['content-clusters-deregister'],

    globalNotify: service(),
    router: service(),

    /**
     * @override
     */
    i18nPrefix: 'components.contentClustersDeregister',

    /**
     * @virtual
     */
    cluster: undefined,

    /**
     * State of 'understand the risk' checkbox
     * @type {boolean}
     */
    understandChecked: false,

    oneproviderName: reads('cluster.name'),

    clusterCreationTimeText: computed(
      'cluster.creationTime',
      function clusterCreationTimeText() {
        const creationTime = this.get('cluster.creationTime');
        return dateFormat([creationTime], { format: 'dateWithMinutes' });
      }
    ),

    init() {
      this._super(...arguments);
      this.updateStatsProxy();
    },

    /**
     * @override
     * Resolves something like:
     * `{ usersCount: 2, groupsCount: 3, spacesCount: 4 }`
     */
    fetchStats() {
      const cluster = this.get('cluster');
      if (get(cluster, 'canViewPrivateData')) {
        return this.getOneproviderClusterResourceStats(cluster);
      } else {
        return reject();
      }
    },

    getOneproviderClusterResourceStats(cluster) {
      return oneproviderClusterResourceStats(cluster);
    },

    deregister() {
      const cluster = this.get('cluster');
      return get(cluster, 'provider')
        .then(provider => provider.destroyRecord());
    },

    afterDeregister() {
      const {
        globalNotify,
        cluster,
        router,
      } = this.getProperties('globalNotify', 'cluster', 'router');
      globalNotify.success(this.t('deregisterSuccess'));
      cluster.deleteRecord();
      return router.transitionTo('onedata.sidebar', 'clusters');
    },

    handleDeregisterError(error) {
      this.get('globalNotify').backendError(this.t('deregistering'), error);
      throw error;
    },

    cancel() {
      const {
        cluster,
        router,
      } = this.getProperties('cluster', 'router');
      return router.transitionTo(
        'onedata.sidebar.content.aspect',
        'clusters',
        get(cluster, 'entityId'),
        'provider'
      );
    },

    actions: {
      deregister() {
        return this.deregister()
          .then(() => this.afterDeregister())
          .catch(error => this.handleDeregisterError(error));
      },
      cancel() {
        return this.cancel();
      },
    },
  }
);
