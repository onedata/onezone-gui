/**
 * A service that contain functionality related to privacy policy.
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

export default Service.extend(
  createDataProxyMixin('privacyPolicy'), {
    router: service(),
    guiMessageManager: service(),

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
    
    /**
     * @override
     */
    fetchPrivacyPolicy() {
      return this.get('guiMessageManager').getMessage('privacy_policy')
        .then(message => DOMPurify.sanitize(message).toString());
    },
  }
);
