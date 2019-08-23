import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  tagName: '',

  privacyPolicyManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.cookiesConsent',

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
