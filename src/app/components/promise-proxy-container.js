/**
 * PromiseProxyContainer component extension specific for Onezone model.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PromiseProxyContainer from 'onedata-gui-common/components/promise-proxy-container';
import { computed } from '@ember/object';
import { or } from '@ember/object/computed';

export default PromiseProxyContainer.extend({
  /**
   * @override
   */
  isLoaded: computed(
    'proxy.{isFulfilled,content.isForbidden}',
    function isLoaded() {
      return this.get('proxy.isFulfilled') &&
        !this.get('proxy.content.isForbidden');
    }
  ),

  /**
   * @override
   */
  isError: or('proxy.isRejected', 'proxy.content.isForbidden'),

  /**
   * @override
   */
  errorReason: or('proxy.reason', 'proxy.content.forbiddenError'),
});
