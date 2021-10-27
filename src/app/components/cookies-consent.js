/**
 * A popup window with cookie consent.
 *
 * @module components/cookies-consent
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';

export default Component.extend(I18n, {
  privacyPolicyManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.cookiesConsent',

  /**
   * @type {Ember.ComputedProperty<HtmlSafe|undefined>}
   */
  content: computed(
    'privacyPolicyManager.cookieConsentNotification',
    function content() {
      const consentContent =
        this.get('privacyPolicyManager.cookieConsentNotification');
      return consentContent ? htmlSafe(consentContent) : undefined;
    }
  ),

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  areCookiesAccepted: reads('privacyPolicyManager.areCookiesAccepted'),

  actions: {
    acceptCookies() {
      this.get('privacyPolicyManager').acceptCookies();
    },
  },
});
