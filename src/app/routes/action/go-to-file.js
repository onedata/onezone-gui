/**
 * Handles go-to-file URL actions provided with simplified URL.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import GoToFileUrlActionHandler from 'onezone-gui/utils/url-action-handlers/go-to-file';
import globals from 'onedata-gui-common/utils/globals';

export default Route.extend({
  router: service(),

  /**
   * @param {string} file_id
   * @param {GoToFileUrlActionHandler.GoToFileActionType} file_action
   * @returns {Promise}
   */
  async model({ file_id: fileId, file_action: fileAction }) {
    if (!fileId) {
      this.router.transitionTo('/');
    }
    const handler = GoToFileUrlActionHandler.create({
      ownerSource: this,
    });
    const path = handler.generatePath({ fileId, fileAction });
    if (!path) {
      this.router.transitionTo('/');
    }
    return globals.location.replace(path);
  },
});
