/**
 * Add new cluster using token view
 *
 * @module components/content-clusters-add
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(I18n, createDataProxyMixin('token'), {
  clusterManager: service(),

  i18nPrefix: 'components.contentClustersAdd',

  init() {
    this._super(...arguments);
    this.updateTokenProxy();
  },

  /**
   * @override
   */
  fetchToken() {
    return this.get('clusterManager').getOnezoneRegistrationToken();
  },
});
