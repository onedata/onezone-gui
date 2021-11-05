/**
 * A component that shows privacy policy content.
 * 
 * @module components/content-privacy-policy
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import I18n from 'onedata-gui-common/mixins/components/i18n';

export default Component.extend(I18n, {
  classNames: ['content-privacy-policy'],
  
  privacyPolicyManager: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentPrivacyPolicy',

  /**
   * @type {Ember.ComputedProperty<string>}
   */
  content: reads('privacyPolicyManager.privacyPolicy'),

  init() {
    this._super(...arguments);
    if (!this.get('content')) {
      this.get('router').replaceWith('index');
    }
  },
});