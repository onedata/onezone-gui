/**
 * Override opening cluster in Onezone method
 * 
 * @module components/content-clusters-onepanel-redirect
 * @author Jakub Liput
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import ContentClustersOnepanelRedirect from 'onedata-gui-common/components/content-clusters-onepanel-redirect';
import { inject as service } from '@ember/service';
import DisabledErrorCheckList from 'onedata-gui-common/utils/disabled-error-check-list';
import { Promise } from 'rsvp';
import { next } from '@ember/runloop';

export default ContentClustersOnepanelRedirect.extend({
  router: service(),
  guiUtils: service(),

  /**
   * @override
   */
  openClusterErrorInOnezone() {
    const {
      router,
      cluster,
      guiUtils,
    } = this.getProperties('router', 'cluster', 'guiUtils');
    const clusterRoutableId = guiUtils.getRoutableIdFor(cluster);
    new DisabledErrorCheckList('clusterEndpoint')
      .disableErrorCheckFor(clusterRoutableId);
    return new Promise((resolve, reject) => {
      next(() => {
        router.transitionTo(
          'onedata.sidebar.content.aspect',
          'clusters',
          clusterRoutableId,
          'endpoint-error'
        ).then(resolve, reject);
      });
    });
  },
});
