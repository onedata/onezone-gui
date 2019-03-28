/**
 * Redirect to Onepanel GUI (hosted on Onezone domain) on component load
 * 
 * @module components/content-clusters-onepanel-redirect
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import checkImg from 'onedata-gui-common/utils/check-img';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';
import DisabledErrorCheckList from 'onedata-gui-common/utils/disabled-error-check-list';

export default Component.extend({
  classNames: ['content-clusters-onepanel-redirect'],

  globalNotify: service(),
  router: service(),

  /**
   * @virtual
   * @type {models/Cluster} cluster item
   */
  cluster: undefined,

  clusterId: reads('cluster.entityId'),

  clusterType: reads('cluster.type'),

  onepanelPathAbbrev: computed('clusterType', function onepanelPathAbbrev() {
    return this.get('clusterType') === 'oneprovider' ? 'opp' : 'ozp';
  }),

  onepanelHref: computed(
    'onepanelPathAbbrev',
    'clusterId',
    function onepanelHref() {
      const clusterId = this.get('clusterId');
      return `${location.origin}/${this.get('onepanelPathAbbrev')}/${clusterId}/i#/clusters/${clusterId}`;
    }),

  redirectProxy: computed('cluster.domain', function redirectProxy() {
    return PromiseObject.create({ promise: this.redirectToOnepanel() });
  }),

  redirectToOnepanel() {
    const origin = this.get('cluster.standaloneOrigin');
    return checkImg(`${origin}/favicon.ico`)
      .then(isAvailable => {
        if (isAvailable) {
          window.location = this.get('onepanelHref');
        } else {
          const {
            router,
            cluster,
          } = this.getProperties('router', 'cluster');
          new DisabledErrorCheckList('clusterEndpoint')
            .disableErrorCheckFor(get(cluster, 'entityId'));
          return router.transitionTo(
            'onedata.sidebar.content.aspect',
            'clusters',
            get(cluster, 'entityId'),
            'endpoint-error'
          );
        }
      });
  },
});
