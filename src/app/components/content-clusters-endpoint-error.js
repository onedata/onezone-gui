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
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ErrorCheckViewMixin from 'onedata-gui-common/mixins/error-check-view';

export default Component.extend(I18n, ErrorCheckViewMixin, {
  classNames: 'content-clusters-endpoint-error',
  i18nPrefix: 'components.contentClustersEndpointError',

  alertService: service('alert'),
  i18n: service(),
  router: service(),

  /**
   * @virtual
   */
  cluster: undefined,

  /**
   * @override
   */
  checkErrorType: 'clusterEndpoint',

  /**
   * @override
   */
  resourceId: reads('clusterEntityId'),

  emergencyOnepanelUrl: computed('cluster.standaloneOriginProxy.content',
    function emergencyOnepanelUrl() {
      return this.get('cluster.standaloneOriginProxy.content') + ':9443';
    }
  ),

  clusterEntityId: reads('cluster.entityId'),

  /**
   * @override
   */
  checkError() {
    return this.get('cluster').updateIsOnlineProxy().then(online => !online);
  },

  /**
   * @override
   */
  redirectToIndex() {
    return this.get('router').transitionTo(
      'onedata.sidebar.content.aspect',
      'clusters',
      this.get('clusterEntityId'),
      'index'
    );
  },

  didInsertElement() {
    this._super(...arguments);
    this.getTryErrorCheckProxy().then(isError => {
      if (isError === undefined || isError === true) {
        this.get('cluster.standaloneOriginProxy').then(standaloneOrigin => {
          const {
            i18n,
            alertService,
          } = this.getProperties('i18n', 'alertService');
          alertService.error(null, {
            componentName: 'alerts/endpoint-error',
            header: i18n.t('components.alerts.endpointError.headerPrefix') +
              ' ' +
              i18n.t('components.alerts.endpointError.onepanel'),
            url: standaloneOrigin,
            serverType: 'onepanel',
          });
        });
      }
    });
  },
});
