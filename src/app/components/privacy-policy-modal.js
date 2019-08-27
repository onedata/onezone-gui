/**
 * A modal that shows privacy policy content.
 *
 * @module components/privacy-policy-modal
 * @author Michał Borzęcki
 * @copyright (C) 2019 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';

export default Component.extend(I18n, createDataProxyMixin('privacyPolicy'), {
  privacyPolicyManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.privacyPolicyModal',

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isOpened: alias('privacyPolicyManager.isPrivacyPolicyInfoVisible'),

  /**
   * @override
   */
  fetchPrivacyPolicy() {
    return this.get('privacyPolicyManager').getPrivacyPolicyContent();
  },

  actions: {
    onHidden() {
      this.get('privacyPolicyManager').hidePrivacyPolicyInfo();
    },
  },
});
