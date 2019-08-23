/**
 * A service that contain functionality related to privacy policy and cookies
 * consent.
 *
 * @module services/privacy-policy-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

const cookiesAcceptedCookieName = 'cookiesAccepted';

export default Service.extend({
  cookies: service(),
  onedataRpc: service(),
  
  /**
   * @type {boolean}
   */
  areCookiesAccepted: false,

  /**
   * @type {boolean}
   */
  isPrivacyPolicyInfoVisible: false,

  init() {
    this._super(...arguments);

    this.set(
      'areCookiesAccepted',
      this.get('cookies').read(cookiesAcceptedCookieName)
    );
  },

  /**
   * @returns {Promise<string>}
   */
  getPrivacyPolicyContent() {
    return this.get('onedataRpc').request('getPrivacyPolicy');
  },

  /**
   * @returns {undefined}
   */
  acceptCookies() {
    this.get('cookies').write(cookiesAcceptedCookieName, true, { path: '/' });
    this.set('areCookiesAccepted', true);
  },

  /**
   * @returns {undefined}
   */
  showPrivacyPolicyInfo() {
    this.set('isPrivacyPolicyInfoVisible', true);
  },

  /**
   * @returns {undefined}
   */
  hidePrivacyPolicyInfo() {
    this.set('isPrivacyPolicyInfoVisible', false);
  },
});
