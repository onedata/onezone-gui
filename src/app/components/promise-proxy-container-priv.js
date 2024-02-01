/**
 * PromiseProxyContainerPriv component extension specific for Onezone model.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import PromiseProxyContainer from 'onedata-gui-common/components/promise-proxy-container';
import { computed } from '@ember/object';

export default PromiseProxyContainer.extend({
  /**
   * @override
   */
  isLoading: computed('proxy.isPending', 'injectedIsLoading', {
    get() {
      return this.injectedIsLoading ?? this.proxy?.isPending;
    },
    set(key, value) {
      return this.injectedIsLoading = value;
    },
  }),

  /**
   * @override
   */
  isLoaded: computed(
    'proxy.{isFulfilled,content.isForbidden}', 'injectedIsLoaded', {
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
    'proxy.{isRejected,content.isForbidden}', 'injectedIsError', {
      get() {
        return this.injectedIsError ??
          (this.proxy?.isRejected || this.proxy?.content?.isForbidden);
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
    'proxy.{reason,content.forbiddenError}', 'injectedErrorReason', {
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
