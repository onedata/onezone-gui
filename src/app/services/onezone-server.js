import { default as Service, inject } from '@ember/service';

export default Service.extend({
  onedataRpc: inject(),

  /**
   * Fetch a URL to login endpoint.
   *
   * @param {String} identityProvider One of id providers, eg. google, dropbox
   * @returns {RSVP.Promise} A backend operation completion:
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
   * @returns {RSVP.Promise} A backend operation completion:
   * - ``resolve(object: data)`` when successfully fetched the redirect URL
   *   - ``data.url`` (string)
   * - ``reject(object: error)`` on failure
   */
  getProviderRedirectUrl(providerId) {
    return this.get('onedataRpc').request('getProviderRedirectURL', {
      providerId,
    });
  },

});
