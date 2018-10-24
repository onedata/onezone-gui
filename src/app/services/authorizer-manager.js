/**
 * Provides functions, which fetch data about authorizers.
 *
 * @module services/authorizer-manager
 * @author Michal Borzecki
 * @copyright (C) 2018 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  onedataConnection: service(),

  /**
   * Returns array of authorizers info objects supported by backend
   * @return {Array<AuthorizerInfo>}
   */
  getAvailableAuthorizers() {
    return this.get('onedataConnection.identityProviders');
  },
});
