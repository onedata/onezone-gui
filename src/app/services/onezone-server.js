/**
 * A set of server methods for acquiring data which is not directly related to any model.
 *
 * @author Jakub Liput, Michał Borzęcki
 * @copyright (C) 2018-2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

export default Service.extend({
  onedataRpc: service(),
  onedataGraph: service(),

  /**
   * @returns {Promise<number>} Backend clock timestamp
   */
  getServerTime() {
    return this.get('onedataGraph').request({
      gri: 'provider.null.current_time:private',
      operation: 'get',
      subscribe: false,
    }).then(({ timeMillis }) => Math.floor(timeMillis / 1000));
  },

  /**
   * Fetch a URL to login endpoint.
   *
   * @param {String} idp One of id providers, eg. google, dropbox
   * @param {boolean} linkAccount If true - get URL to link existing account
   * @param {redirectUrl} redirectUrl url to redirect to after login/link
   * @returns {Promise} A backend operation completion:
   * - ``resolve(object: data)`` when successfully fetched the endpoint
   *   - ``data.method`` (string)
   *   - ``data.url`` (string)
   *   - ``data.formData`` (object|undefined)
   * - ``reject(object: error)`` on failure
   */
  getLoginEndpoint(idp, linkAccount, redirectUrl) {
    return this.get('onedataRpc').request('getLoginEndpoint', {
      testMode: false,
      idp,
      linkAccount,
      redirectUrl,
    });
  },

  /**
   * Fetch a URL to test login endpoint.
   *
   * @param {String} idp One of id providers, eg. google, dropbox
   * @returns {Promise} A backend operation completion:
   * - ``resolve(object: data)`` when successfully fetched the endpoint
   *   - ``data.method`` (string)
   *   - ``data.url`` (string)
   *   - ``data.formData`` (object|undefined)
   * - ``reject(object: error)`` on failure
   */
  getTestLoginEndpoint(idp) {
    return this.get('onedataRpc').request('getLoginEndpoint', {
      testMode: true,
      idp,
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
  getProviderRedirectUrl(providerId, path = '/') {
    return this.get('onedataRpc').request('getProviderRedirectURL', {
      providerId,
      path,
    });
  },

  /**
   * Fetch supported authorizers.
   *
   * @param {boolean} testMode
   * @returns {Promise} A backend operation completion:
   * - ``resolve(object: data)`` when successfully fetched idps
   *   - ``data.idps`` (array<object>)
   * - ``reject(object: error)`` on failure
   */
  getSupportedIdPs(testMode) {
    return this.get('onedataRpc').request('getSupportedIdPs', { testMode });
  },
});
