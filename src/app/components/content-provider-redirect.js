/**
 * Immediately tries to fetch provider redirection URL
 * and automatically go to it 
 *
 * @module components/content-provider-redirect
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import checkImg from 'onedata-gui-common/utils/check-img';

export default Component.extend(I18n, {
  classNames: ['content-provider-redirect'],

  onezoneServer: service(),
  globalNotify: service(),
  i18n: service(),
  alert: service(),
  router: service(),

  /**
   * @override 
   */
  i18nPrefix: 'components.contentProviderRedirect.',

  /**
   * @virtual
   * @type {models/Provider}
   */
  provider: undefined,

  /**
   * @virutal optional
   * @type {string}
   */
  spaceId: undefined,

  /**
   * @type {boolean}
   */
  isLoading: false,

  /**
   * For test purposes. Do not change it except when testing!
   * @type {Window}
   */
  _window: window,

  goToProviderProxy: computed('spaceId', function goToProviderProxy() {
    return PromiseObject.create({
      promise: this._goToProvider(this.get('spaceId')),
    });
  }),

  oneproviderOrigin: computed('provider.domain', function oneproviderOrigin() {
    return `https://${this.get('provider.domain')}`;
  }),

  /**
   * @returns {Promise<boolean>}
   */
  checkIsProviderAvailable() {
    return checkImg(`${this.get('oneproviderOrigin')}/favicon.ico`);
  },

  _goToProvider(spaceId) {
    return this.checkIsProviderAvailable()
      .then(isAvailable => {
        if (isAvailable) {
          const path = spaceId ? `onedata/data/${spaceId}` : '';
          const clusterId =
            parseGri(this.get('provider').belongsTo('cluster').id()).entityId;
          const _window = this.get('_window');
          _window.location = `/op/${clusterId}/i#/${path}`;
        } else {
          const i18n = this.get('i18n');
          this.get('alert').error(null, {
            componentName: 'alerts/endpoint-error',
            header: i18n.t('components.alerts.endpointError.headerPrefix') +
              ' ' +
              i18n.t('components.alerts.endpointError.onepanel'),
            url: this.get('oneproviderOrigin'),
            serverType: 'oneprovider',
          });
          // FIXME: should redirect to providers map
          this.get('router').transitionTo('onedata.sidebar', 'data');
          throw { type: 'endpoint-error' };
        }
      });
  },
});
