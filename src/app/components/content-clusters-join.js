/**
 * A component that shows a form for joining a cluster.
 *
 * @module components/content-clusters-join
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  clusterActions: service(),

  i18nPrefix: 'components.contentClustersJoin',

  /**
   * @type {string}
   */
  token: undefined,

  didInsertElement() {
    this._super(...arguments);
    this.$('#join-cluster-token').focus();
  },

  actions: {
    joinCluster(token) {
      return this.get('clusterActions').joinCluster(token);
    },
  },
});
