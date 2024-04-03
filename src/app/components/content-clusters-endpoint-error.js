/**
 * Shown when connection test to Onepanel API fails before redirection to cluster
 * view
 *
 * @author Jakub Liput
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { reads } from '@ember/object/computed';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ErrorCheckViewMixin from 'onedata-gui-common/mixins/error-check-view';
import Looper from 'onedata-gui-common/utils/looper';
import { resolve } from 'rsvp';
import globals from 'onedata-gui-common/utils/globals';

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

  /**
   * @type {number}
   */
  requestCounter: 0,

  /**
   * @type {number}
   */
  requestSlowInterval: 10000,

  /**
   * @type {number}
   */
  requestFastInterval: 500,

  /**
   * @type {Looper}
   */
  connectionChecker: undefined,

  emergencyOnepanelUrl: computed('cluster.standaloneOriginProxy.content',
    function emergencyOnepanelUrl() {
      return this.get('cluster.standaloneOriginProxy.content') + ':9443';
    }
  ),

  onepanelConfigurationUrl: computed('cluster.standaloneOriginProxy.content',
    function onepanelConfigurationUrl() {
      return this.get('cluster.standaloneOriginProxy.content') +
        '/api/v3/onepanel/configuration';
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

  init() {
    this._super(...arguments);
    const connectionChecker = Looper.create({
      immediate: false,
      interval: this.get('requestSlowInterval'),
    });
    connectionChecker.on('tick', () => this.checkConnectionToProvider());
    this.set('connectionChecker', connectionChecker);
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
            setFastPollingCallback: this.setFastPolling.bind(this),
          });
        });
      }
    });
  },

  destroy() {
    try {
      this.destroyConnectionChecker();
    } finally {
      this._super(...arguments);
    }
  },

  setFastPolling(enabled) {
    if (enabled) {
      this.set('connectionChecker.interval', this.get('requestFastInterval'));
      this.set('requestCounter', 0);
    }
  },

  checkConnectionToProvider() {
    resolve($.get(this.get('onepanelConfigurationUrl')))
      .then(() => {
        this.destroyConnectionChecker();
        globals.location.reload();
      })
      .catch(() => {});
    if (this.get('connectionChecker.interval') === this.get('requestFastInterval')) {
      const requestCounter = this.get('requestCounter');
      if (requestCounter < 10) {
        this.incrementProperty('requestCounter');
      } else {
        this.set('connectionChecker.interval', this.get('requestSlowInterval'));
      }
    }
  },

  destroyConnectionChecker() {
    const connectionChecker = this.get('connectionChecker');
    if (connectionChecker) {
      connectionChecker.destroy();
    }
  },

  actions: {
    setFastPolling() {
      this.setFastPolling(true);
    },
  },
});
