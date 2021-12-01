/**
 * Provides functions associated with GUI messages.
 *
 * @module services/gui-message-manager
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { get, computed } from '@ember/object';
import DOMPurify from 'npm:dompurify';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';
import { Promise } from 'rsvp';

const cookiesAcceptedCookieName = 'cookies-accepted';

export default Service.extend(
  createDataProxyMixin('privacyPolicy'),
  createDataProxyMixin('acceptableUsePolicy'),
  createDataProxyMixin('cookieConsentNotification'), {
    store: service(),
    router: service(),
    cookies: service(),

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
      }
    ),
    
    /**
     * @type {Ember.ComputedProperty<string|null>}
     */
    acceptableUsePolicyUrl: computed(
      'acceptableUsePolicy',
      function acceptableUsePolicyUrl() {
        if (this.get('acceptableUsePolicy')) {
          return this.get('router').urlFor('public.acceptable-use-policy');
        }
        return null;
      }
    ),

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
    fetchPrivacyPolicy() {
      return this.getMessage('privacy_policy')
        .then(message => DOMPurify.sanitize(message).toString());
    },

    /**
     * @override
     */
    fetchAcceptableUsePolicy() {
      return this.getMessage('acceptable_use_policy')
        .then(message => DOMPurify.sanitize(message).toString());
    },

    /**
     * @override
     */
    fetchCookieConsentNotification() {
      return Promise.all([
        this.get('privacyPolicyProxy').then(() => this.get('privacyPolicyUrl')),
        this.get('acceptableUsePolicyProxy').then(() => this.get('acceptableUsePolicyUrl')),
        this.getMessage('cookie_consent_notification'),
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
      this.get('cookies').write(cookiesAcceptedCookieName, true, { path: '/' });
      this.set('areCookiesAccepted', true);
    },
  }
);
