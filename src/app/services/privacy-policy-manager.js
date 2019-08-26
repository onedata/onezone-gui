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
import { computed } from '@ember/object';
import DOMPurify from 'npm:dompurify';

const cookiesAcceptedCookieName = 'cookies-accepted';

export default Service.extend({
  cookies: service(),
  onedataRpc: service(),
  router: service(),
  
  /**
   * @type {boolean}
   */
  areCookiesAccepted: false,

  /**
   * @type {boolean}
   */
  isPrivacyPolicyInfoVisible: false,

  /**
   * @override
   */
  showPrivacyPolicyAction: computed(function showPrivacyPolicyAction() {
    return () => this.showPrivacyPolicyInfo();
  }),

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
    return this.get('onedataRpc').request('getPrivacyPolicy')
      .then(({ content }) => DOMPurify.sanitize(content));
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
