/**
 * Content of popup with information about cluster
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import ClusterInfoContent from 'onedata-gui-common/components/cluster-info-content';

export default ClusterInfoContent.extend({
  router: service(),
  guiUtils: service(),

  /**
   * @override
   */
  linkToCluster: computed('record', function linkToCluster() {
    return this.router.urlFor(
      'onedata.sidebar.content.aspect',
      'clusters',
      this.guiUtils.getRoutableIdFor(this.record),
      'index'
    );
  }),
});
