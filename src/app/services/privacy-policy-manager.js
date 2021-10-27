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
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { Promise } from 'rsvp';

const cookiesAcceptedCookieName = 'cookies-accepted';

export default Service.extend(
  createDataProxyMixin('privacyPolicy'),
  createDataProxyMixin('cookieConsentNotification'), {
    cookies: service(),
    guiMessageManager: service(),
    router: service(),

    /**
     * @type {boolean}
     */
    areCookiesAccepted: false,

    /**
     * @type {Ember.ComputedProperty<string|null>}
     */
    privacyPolicyUrl: computed(
      'privacyPolicy',
      function privacyPolicyUrl() {
        if (this.get('privacyPolicy')) {
          return this.get('router').urlFor('public.privacy-policy');
        }
        return null;
    }),

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
    fetchPrivacyPolicy() {
      return this.get('guiMessageManager').getMessage('privacy_policy')
        .then(message => DOMPurify.sanitize(message).toString());
    },

    /**
     * @override
     */
    fetchCookieConsentNotification() {
      return Promise.all([
        this.get('privacyPolicyProxy').then(() => this.get('privacyPolicyUrl')),
        this.get('guiMessageManager').getMessage('cookie_consent_notification'),
      ]).then(([privacyPolicyUrl, message]) =>
        DOMPurify.sanitize(message, { ALLOWED_TAGS: ['#text'] }).toString()
          .replace(
            /\[privacy-policy\](.*?)\[\/privacy-policy\]/gi,
            `<a href="${privacyPolicyUrl || ''}" class="clickable privacy-policy-link">$1</a>`
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
