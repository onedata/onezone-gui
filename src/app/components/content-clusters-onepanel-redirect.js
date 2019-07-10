/**
 * Redirect to Onepanel GUI (hosted on Onezone domain) on component load
 * 
 * @module components/content-clusters-onepanel-redirect
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import checkImg from 'onedata-gui-common/utils/check-img';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import { inject as service } from '@ember/service';
import DisabledErrorCheckList from 'onedata-gui-common/utils/disabled-error-check-list';
import { Promise } from 'rsvp';
import { onepanelAbbrev } from 'onedata-gui-common/utils/onedata-urls';

export default Component.extend({
  classNames: ['content-clusters-onepanel-redirect'],

  globalNotify: service(),
  router: service(),
  guiUtils: service(),

  /**
   * @virtual
   * @type {models/Cluster} cluster item
   */
  cluster: undefined,

  clusterId: reads('cluster.entityId'),

  clusterType: reads('cluster.type'),

  onepanelHref: computed(
    'clusterId',
    'aspect',
    function onepanelHref() {
      const {
        clusterId,
        aspect,
      } = this.getProperties('clusterId', 'aspect');
      let href =
        `${location.origin}/${onepanelAbbrev}/${clusterId}/i#/onedata/clusters/${clusterId}`;
      if (aspect) {
        href += `/${aspect}`;
      }
      return href;
    }),

  redirectProxy: computed('cluster.domain', function redirectProxy() {
    return PromiseObject.create({ promise: this.redirectToOnepanel() });
  }),

  checkOnepanelAvailability() {
    return this.get('cluster.standaloneOriginProxy').then(standaloneOrigin => {
      return checkImg(`${standaloneOrigin}/favicon.ico`);
    });
  },

  redirectToOnepanelApp() {
    window.location.replace(this.get('onepanelHref'));
  },

  redirectToOnepanel() {
    return this.checkOnepanelAvailability()
      .then(isAvailable => {
        if (isAvailable) {
          return new Promise((resolve, reject) => {
            try {
              this.redirectToOnepanelApp();
            } catch (error) {
              reject(error);
            }
          });
        } else {
          const {
            router,
            cluster,
            guiUtils,
          } = this.getProperties('router', 'cluster', 'guiUtils');
          const clusterRoutableId = guiUtils.getRoutableIdFor(cluster);
          new DisabledErrorCheckList('clusterEndpoint')
            .disableErrorCheckFor(clusterRoutableId);
          return router.transitionTo(
            'onedata.sidebar.content.aspect',
            'clusters',
            clusterRoutableId,
            'endpoint-error'
          );
        }
      });
  },
});
