/**
 * A service that contain functionality related to acceptable use policy.
 *
 * @module services/acceptable-use-policy-manager
 * @author Agnieszka Warchoł
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import DOMPurify from 'npm:dompurify';
import createDataProxyMixin from 'onedata-gui-common/utils/create-data-proxy-mixin';


export default Service.extend(
  createDataProxyMixin('acceptableUsePolicy'), {
    guiMessageManager: service(),
    router: service(),

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
    }),

    /**
     * @override
     */
    fetchAcceptableUsePolicy() {
      return this.get('guiMessageManager').getMessage('acceptable_use_policy')
        .then(message => DOMPurify.sanitize(message).toString());
    },
  }
);
