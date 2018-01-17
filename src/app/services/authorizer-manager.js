/**
 * Provides functions, which fetch data about authorizers.
 *
 * @module services/authorizer-manager
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject } from '@ember/service';
import authorizers from 'onezone-gui/utils/authorizers';

export default Service.extend({
  onedataConnection: inject(),

  /**
   * Returns array of authorizers types supported by backend
   * @return {Array<AuthorizerInfo>}
   */
  getAvailableAuthorizersTypes() {
    return this.get('onedataConnection.identityProviders');
  },

  /**
   * Returns array of authorizers info objects supported by backend
   * @return {Array<AuthorizerInfo>}
   */
  getAvailableAuthorizers() {
    const predefinedAuthorizersTypes = authorizers.map(auth => auth.type);
    const availableTypes = this.getAvailableAuthorizersTypes();
    const authorizersInfo = [];
    predefinedAuthorizersTypes.forEach((auth, index) => {
      if (availableTypes.indexOf(auth) > -1) {
        authorizersInfo.push(authorizers[index]);
      }
    });
    availableTypes.forEach((auth) => {
      if (predefinedAuthorizersTypes.indexOf(auth) === -1) {
        // default configuration for unknown authorizer
        authorizersInfo.push({
          type: auth,
          name: auth.capitalize(),
          iconType: 'oneicon',
          iconName: 'key',
        });
      }
    });
    return authorizersInfo;
  },
});
