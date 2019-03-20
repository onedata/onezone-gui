/**
 * Shown when connection test to Onepanel API fails before redirection to cluster
 * view
 * 
 * @module components/content-clusters-endpoint-error
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: 'content-clusters-endpoint-error',
  i18nPrefix: 'components.contentClustersEndpointError',

  alertService: service('alert'),
  i18n: service(),

  /**
   * @virtual
   */
  cluster: undefined,

  standaloneOnepanelUrl: reads('cluster.standaloneOrigin'),

  clusterEntityId: reads('cluster.entityId'),

  didInsertElement() {
    const {
      i18n,
      alertService,
      standaloneOnepanelUrl,
    } = this.getProperties('i18n', 'alertService', 'standaloneOnepanelUrl');
    alertService.error(null, {
      componentName: 'alerts/endpoint-error',
      header: i18n.t('components.alerts.endpointError.headerPrefix') +
        ' ' +
        i18n.t('components.alerts.endpointError.onepanel'),
      url: standaloneOnepanelUrl,
      serverType: 'onepanel',
    });
  },
});
