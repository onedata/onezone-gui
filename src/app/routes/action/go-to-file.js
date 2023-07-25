/**
 * Handles go-to-file URL file_id part provided with prettt URL.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  router: service(),

  /**
   * @param {string} file_id
   * @returns {{ fileId: string }}
   */
  model({ file_id: fileId }) {
    if (!fileId) {
      this.router.transitionTo('/');
    }
    return {
      fileId,
    };
  },
});
