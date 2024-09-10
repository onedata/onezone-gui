/**
 * Provides functions, which fetch data about authorizers.
 *
 * Note: this file shoul have "authenticator" naming instead of "authorizer".
 * It is keep in some files and may be refactored some day.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2018-2024 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';
import PromiseArray from 'onedata-gui-common/utils/ember/promise-array';

/**
 * @typedef {Object} Authenticator
 * @property {'basicAuth'|string} id ID of Identify Provider or special "basicAuth",
 *   which is indication that user can authenticate using username and password.
 * @property {string} iconPath
 * @property {string} iconBackgroundColor
 * @property {string} displayName
 */

export default Service.extend({
  onezoneServer: service(),

  /**
   * @type {PromiseArray<Array<Authenticator>>|undefined}
   */
  testAuthorizersProxy: undefined,

  /**
   * @type {PromiseArray<Array<Authenticator>>|undefined}
   */
  authorizersProxy: undefined,

  /**
   * Returns array of authorizers info objects supported by backend
   * @param {boolean} testMode
   * @returns {Array<Authenticator>}
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
