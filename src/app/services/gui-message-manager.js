/**
 * Provides functions associated with GUI messages.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import DOMPurify from 'dompurify';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { Promise } from 'rsvp';
import hasEmptyHtmlContent from 'onedata-gui-common/utils/has-empty-html-content';
import globals from 'onedata-gui-common/utils/globals';

const cookiesAcceptedCookieName = 'cookies-accepted';

export default Service.extend(
  createDataProxyMixin('privacyPolicy'),
  createDataProxyMixin('termsOfUse'),
  createDataProxyMixin('cookieConsentNotification'), {
    store: service(),
    router: service(),
    cookies: service(),

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
        if (this.privacyPolicy) {
          return globals.location.pathname + this.router.urlFor('public.privacy-policy');
        }
        return null;
      }
    ),

    /**
     * @type {Ember.ComputedProperty<string|null>}
     */
    termsOfUseUrl: computed(
      'termsOfUse',
      function termsOfUseUrl() {
        if (this.termsOfUse) {
          return globals.location.pathname + this.router.urlFor('public.terms-of-use');
        }
        return null;
      }
    ),

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
      return this.getMessage('privacy_policy')
        .then(message => {
          const messageText = DOMPurify.sanitize(message).toString();
          return hasEmptyHtmlContent(messageText) ? '' : messageText;
        });
    },

    /**
     * @override
     */
    fetchTermsOfUse() {
      return this.getMessage('terms_of_use')
        .then(message => {
          const messageText = DOMPurify.sanitize(message).toString();
          return hasEmptyHtmlContent(messageText) ? '' : messageText;
        });
    },

    /**
     * @override
     */
    fetchCookieConsentNotification() {
      return Promise.all([
        this.get('privacyPolicyProxy').then(() => this.get('privacyPolicyUrl')),
        this.get('termsOfUseProxy').then(() => this.get('termsOfUseUrl')),
        this.getMessage('cookie_consent_notification'),
      ]).then(([privacyPolicyUrl, termsOfUseUrl, message]) => {
        const messageText = DOMPurify.sanitize(message, { ALLOWED_TAGS: ['#text'] }).toString();
        if (hasEmptyHtmlContent(messageText)) {
          return '';
        } else {
          return messageText.replace(
              /\[privacy-policy\](.*?)\[\/privacy-policy\]/gi,
              `<a href="${privacyPolicyUrl || ''}" class="clickable privacy-policy-link">$1</a>`
            )
            .replace(
              /\[terms-of-use\](.*?)\[\/terms-of-use\]/gi,
              `<a href="${termsOfUseUrl || ''}" class="clickable terms-of-use-link">$1</a>`
            );
        }
      });
    },

    /**
     * @param {string} id message id
     * @returns {Promise<string>}
     */
    getMessage(id) {
      return this.get('store')
        .findRecord('gui-message', `oz_worker.null.gui_message,${id}:private`, {
          adapterOptions: {
            _meta: {
              // GUI messages are not subscribable
              subscribe: false,
            },
          },
        })
        .then(guiMessage => {
          // GUI messages cannot by modified nor deleted in Onezone GUI. Hence GUI
          // message model can be simplified to a single string.
          if (get(guiMessage, 'enabled')) {
            return get(guiMessage, 'body') || undefined;
          } else {
            return undefined;
          }
        });
    },

    /**
     * @returns {undefined}
     */
    acceptCookies() {
      // Setting cookie consent lifetime to ~ 6 months - a half of the maximum
      // lifetime set by ePrivacy Directive and a maximum lifetime for some
      // of protection authorities. More information here:
      // https://www.cookieyes.com/knowledge-base/cookie-consent/how-long-does-cookie-consent-last
      this.get('cookies').write(cookiesAcceptedCookieName, true, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30 * 6,
      });
      this.set('areCookiesAccepted', true);
    },
  }
);
