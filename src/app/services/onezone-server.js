/**
 * A set of known RPC methods used in Onezone with Onedata Sync API
 *
 * @module services/onezone-serer
 * @author Jakub Liput
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { default as Service, inject } from '@ember/service';

export default Service.extend({
  onedataRpc: inject(),

  /**
   * Fetch a URL to login endpoint.
   *
   * @param {String} identityProvider One of id providers, eg. google, dropbox
   * @returns {Promise} A backend operation completion:
   * - ``resolve(object: data)`` when successfully fetched the endpoint
   *   - ``data.method`` (string)
   *   - ``data.url`` (string)
   *   - ``data.formData`` (object|undefined)
   * - ``reject(object: error)`` on failure
   */
  getLoginEndpoint(identityProvider) {
    return this.get('onedataRpc').request('getLoginEndpoint', {
      idp: identityProvider,
    });
  },

  /**
   * Fetch a URL to provider.
   *
   * @param {String} providerId
   * @param {String} path
   * @returns {Promise} A backend operation completion:
   * - ``resolve(object: data)`` when successfully fetched the redirect URL
   *   - ``data.url`` (string)
   * - ``reject(object: error)`` on failure
   */
  getProviderRedirectUrl(providerId, path) {
    return this.get('onedataRpc').request('getProviderRedirectURL', {
      providerId,
      path,
    });
  },

});