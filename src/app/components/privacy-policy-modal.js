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
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  privacyPolicyManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.privacyPolicyModal',

  /**
   * @type {Ember.ComputedProperty<boolean>}
   */
  isOpened: reads('privacyPolicyManager.isPrivacyPolicyInfoVisible'),

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  content: reads('privacyPolicyManager.privacyPolicy'),

  actions: {
    onHidden() {
      this.get('privacyPolicyManager').hidePrivacyPolicyInfo();
    },
  },
});
