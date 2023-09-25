/**
 * PromiseProxyContainer component extension specific for Onezone model.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PromiseProxyContainer from 'onedata-gui-common/components/promise-proxy-container';
import { computed } from '@ember/object';

export default PromiseProxyContainer.extend({
  /**
   * @override
   */
  isLoaded: computed(
    'proxy.{isFulfilled,content.isForbidden}', {
      get() {
        return this.injectedIsLoaded ?? (
          this.proxy?.isFulfilled &&
          !this.proxy?.content?.isForbidden
        );
      },
      set(key, value) {
        return this.injectedIsLoaded = value;
      },
    }
  ),

  /**
   * @override
   */
  isError: computed(
    'proxy.{isRejected,content.isForbidden}', {
      get() {
        return this.injectedIsError ??
          this.proxy?.isRejected ??
          this.proxy?.content?.isForbidden;
      },
      set(key, value) {
        return this.injectedIsError = value;
      },
    }
  ),

  /**
   * @override
   */
  errorReason: computed(
    'proxy.{reason,content.forbiddenError}', {
      get() {
        return this.injectedErrorReason ??
          this.proxy?.reason ??
          this.proxy?.content?.forbiddenError;
      },
      set(key, value) {
        return this.injectedErrorReason = value;
      },
    }
  ),
});
