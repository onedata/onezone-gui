/**
 * Provides show rest api functions ready to use for GUI.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import SpaceRestApiAction from '../utils/space-rest-api-action';

export default Service.extend({
  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     spaceId: String,
   *   }
   *   ```
   * @returns {Utils.SpaceRestApiAction}
   */
  createSpaceRestApiAction(context) {
    return SpaceRestApiAction.create({ ownerSource: this, context });
  },
});
