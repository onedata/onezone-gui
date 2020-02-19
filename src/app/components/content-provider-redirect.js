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
import { Promise } from 'rsvp';

import {
  getOneproviderPath,
  oneproviderTestImagePath,
} from 'onedata-gui-common/utils/onedata-urls';

export default Component.extend(I18n, {
  classNames: ['content-provider-redirect'],

  onezoneServer: service(),
  globalNotify: service(),
  i18n: service(),
  alert: service(),
  router: service(),
  guiUtils: service(),

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
   * @virtual optional
   * @type {string}
   */
  spaceId: undefined,

  /**
   * @virtual optional
   * @type {string} one of: data, shares, transfers
   */
  resourceType: undefined,

  /**
   * @type {boolean}
   */
  isLoading: false,

  /**
   * For test purposes. Do not change it except when testing!
   * @type {Window}
   */
  _window: window,

  goToProviderProxy: computed('spaceId', 'resourceType', function goToProviderProxy() {
    const {
      spaceId,
      resourceType,
    } = this.getProperties('spaceId', 'resourceType');
    return PromiseObject.create({
      promise: this._goToProvider(spaceId, resourceType),
    });
  }),

  oneproviderOrigin: computed('provider.domain', function oneproviderOrigin() {
    return `https://${this.get('provider.domain')}`;
  }),

  /**
   * @returns {Promise<boolean>}
   */
  checkIsProviderAvailable() {
    return checkImg(`${this.get('oneproviderOrigin')}${oneproviderTestImagePath}`);
  },

  showEndpointErrorModal() {
    const i18n = this.get('i18n');
    this.get('alert').error(null, {
      componentName: 'alerts/endpoint-error',
      header: i18n.t('components.alerts.endpointError.headerPrefix') +
        ' ' +
        i18n.t('components.alerts.endpointError.oneprovider'),
      url: this.get('oneproviderOrigin'),
      serverType: 'oneprovider',
    });
  },

  transitionToProviderOnMap(provider) {
    const {
      router,
      guiUtils,
    } = this.getProperties('router', 'guiUtils');
    router.transitionTo(
      'onedata.sidebar.content',
      'providers',
      guiUtils.getRoutableIdFor(provider)
    );
  },

  throwEndpointError() {
    throw { isOnedataCustomError: true, type: 'endpoint-error' };
  },

  redirectToProvider({ provider, spaceId, resourceType }) {
    const _window = this.get('_window');
    const _resourceType = resourceType || spaceId && 'data';
    const path = (spaceId || _resourceType) ?
      `onedata/${_resourceType}/${spaceId}` :
      '';
    const clusterId =
      parseGri(provider.belongsTo('cluster').id()).entityId;
    return new Promise(() => {
      _window.location.replace(getOneproviderPath(clusterId, path));
    });
  },

  _goToProvider(spaceId, resourceType) {
    const provider = this.get('provider');
    return this.checkIsProviderAvailable()
      .then(isAvailable => {
        if (isAvailable) {
          return this.redirectToProvider({
            provider,
            resourceType,
            spaceId,
          });
        } else {
          this.showEndpointErrorModal();
          this.transitionToProviderOnMap(provider);
          this.throwEndpointError();
        }
      });
  },
});
