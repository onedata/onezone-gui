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
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import parseGri from 'onedata-gui-websocket-client/utils/parse-gri';
import PromiseObject from 'onedata-gui-common/utils/ember/promise-object';
import checkImg from 'onedata-gui-common/utils/check-img';
import { Promise, resolve } from 'rsvp';
import config from 'ember-get-config';

const {
  legacyOneproviderVersion,
} = config;

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
    return checkImg(`${this.get('oneproviderOrigin')}/favicon.ico`);
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

  resolveIsProviderVersionLegacy(provider) {
    return get(provider, 'cluster')
      .then(providerCluster => {
        return get(providerCluster, 'workerVersion.release') ===
          legacyOneproviderVersion;
      });
  },

  redirectToProvider({ provider, spaceId, resourceType, isLegacy = false }) {
    const _window = this.get('_window');
    const _resourceType = resourceType || spaceId && 'data';
    const path = (spaceId || _resourceType) ?
      `#/onedata/${_resourceType}/${spaceId}` :
      '#/';
    if (isLegacy) {
      return this.get('onezoneServer')
        // legacy services needs a leading / because redirector does not
        // work when path starts with /
        .getProviderRedirectUrl(get(provider, 'entityId'), `/${path}`)
        .then(({ url }) => {
          return new Promise(() => {
            _window.location.replace(url);
          });
        });
    } else {
      const clusterId =
        parseGri(provider.belongsTo('cluster').id()).entityId;
      return new Promise(() => {
        _window.location.replace(`/opw/${clusterId}/i${path}`);
      });
    }
  },

  _goToProvider(spaceId, resourceType) {
    const provider = this.get('provider');
    return this.resolveIsProviderVersionLegacy(provider).then(isLegacy => {
      (isLegacy ? resolve(true) : this.checkIsProviderAvailable())
      .then(isAvailable => {
        if (isAvailable) {
          return this.redirectToProvider({
            provider,
            resourceType,
            spaceId,
            isLegacy,
          });
        } else {
          this.showEndpointErrorModal();
          this.transitionToProviderOnMap(provider);
          this.throwEndpointError();
        }
      });
    });
  },
});
