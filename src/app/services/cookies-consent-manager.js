/**
 * A service that contain functionality related to cookies consent.
 *
 * @module services/cookie-consent-manager
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import DOMPurify from 'npm:dompurify';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { Promise } from 'rsvp';

const cookiesAcceptedCookieName = 'cookies-accepted';

export default Service.extend(
  createDataProxyMixin('cookieConsentNotification'), {
    cookies: service(),
    guiMessageManager: service(),
    privacyPolicyManager: service(),
    acceptableUsePolicyManager: service(),
    router: service(),

    /**
     * @type {boolean}
     */
    areCookiesAccepted: false,

    init() {
      this._super(...arguments);

      this.set(
        'areCookiesAccepted',
        this.get('cookies').read(cookiesAcceptedCookieName)
      );
    },

    /**
     * @override
     */
    fetchCookieConsentNotification() {
      return Promise.all([
        this.get('privacyPolicyManager.privacyPolicyProxy').then(
          () => this.get('privacyPolicyManager.privacyPolicyUrl')),
        this.get('acceptableUsePolicyManager.acceptableUsePolicyProxy').then(
          () => this.get('acceptableUsePolicyManager.acceptableUsePolicyUrl')),
        this.get('guiMessageManager').getMessage('cookie_consent_notification'),
      ]).then(([privacyPolicyUrl, acceptableUsePolicyUrl, message]) =>
        DOMPurify.sanitize(message, { ALLOWED_TAGS: ['#text'] }).toString()
          .replace(
            /\[privacy-policy\](.*?)\[\/privacy-policy\]/gi,
            `<a href="${privacyPolicyUrl || ''}" class="clickable privacy-policy-link">$1</a>`
        )
        .replace(
            /\[acceptable-use-policy\](.*?)\[\/acceptable-use-policy\]/gi,
            `<a href="${acceptableUsePolicyUrl || ''}" class="clickable acceptable-use-policy-link">$1</a>`
          )
        );
    },

    /**
     * @returns {undefined}
     */
    acceptCookies() {
      this.get('cookies').write(cookiesAcceptedCookieName, true, { path: '/' });
      this.set('areCookiesAccepted', true);
    },
  }
);
