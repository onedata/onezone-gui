/**
 * Provides functions, which fetch data about authorizers.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';

export default Service.extend({
  onezoneServer: service(),

  /**
   * @type {PromiseArray<Array<AuthorizerInfo>>|undefined}
   */
  testAuthorizersProxy: undefined,

  /**
   * @type {PromiseArray<Array<AuthorizerInfo>>|undefined}
   */
  authorizersProxy: undefined,

  /**
   * Returns array of authorizers info objects supported by backend
   * @param {boolean} testMode
   * @returns {Array<AuthorizerInfo>}
   */
  getAvailableAuthorizers(testMode = false) {
    const proxyName = testMode ? 'testAuthorizersProxy' : 'authorizersProxy';
    const existingProxy = this.get(proxyName);
    if (existingProxy) {
      return existingProxy;
    } else {
      return this.set(proxyName, PromiseArray.create({
        promise: this.get('onezoneServer').getSupportedIdPs(testMode)
          .then(({ idps }) => idps),
      }));
    }
  },
});
