/**
 * Provides api samples functions ready to use for GUI.
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import ShowApiSamplesAction from '../utils/api-samples-actions/show-api-samples-action';

export default Service.extend({
  /**
   * @param {Object} context context specification:
   *   ```
   *   {
   *     record: Object,
   *     apiSubject: String,
   *   }
   *   ```
   * @returns {Utils.ShowApiSamplesAction}
   */
  createShowApiSamplesAction(context) {
    return ShowApiSamplesAction.create({ ownerSource: this, context });
  },
});
