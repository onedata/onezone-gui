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
import Looper from 'onedata-gui-common/utils/looper';
import { resolve } from 'rsvp';

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
   * @type {Location}
   */
  _location: location,

  /**
   * @type {number}
   */
  requestCounter: 0,

  /**
   * @type {number}
   */
  requestSlowInterval: 5000,

  /**
   * @type {number}
   */
  requestFastInterval: 500,

  /**
   * @override
   */
  resourceId: reads('clusterEntityId'),

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
    const timeUpdater = new Looper({
      immediate: false,
      interval: this.get('requestSlowInterval'),
    });
    timeUpdater.on('tick', () => this.checkConnectionToProvider());
    this.set('timeUpdater', timeUpdater);
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
      this.destroyTimeUpdater();
    } finally {
      this._super(...arguments);
    }
  },

  setFastPolling(setFastInterval) {
    if (setFastInterval) {
      this.set('timeUpdater.interval', this.get('requestFastInterval'));
      this.set('requestCounter', 0);
    }
  },

  checkConnectionToProvider() {
    resolve($.get(this.get('onepanelConfigurationUrl')))
      .then(() => {
        this.destroyTimeUpdater();
        this.get('_location').reload();
      })
      .catch(() => []);
    if (this.get('timeUpdater.interval') === this.get('requestFastInterval')) {
      const requestCounter = this.get('requestCounter');
      if (requestCounter < 10) {
        this.set('requestCounter', requestCounter + 1);
      } else {
        this.set('timeUpdater.interval', this.get('requestSlowInterval'));
      }
    }
  },

  destroyTimeUpdater() {
    const timeUpdater = this.get('timeUpdater');
    if (timeUpdater) {
      timeUpdater.destroy();
    }
  },

  actions: {
    setFastPolling() {
      this.setFastPolling(true);
    },
  },
});
