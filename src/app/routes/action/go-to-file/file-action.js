/**
 * Handles go-to-file URL action provided with pretty URL.
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
   * @param {GoToFileUrlActionHandler.GoToFileActionType} file_action
   * @param {Transition} transition
   * @returns {void}
   */
  model({ file_action: fileAction }, transition) {
    const { fileId } = this.modelFor('action.go-to-file');
    const handler = GoToFileUrlActionHandler.create({
      ownerSource: this,
    });
    const path = handler.generatePath({ fileId, fileAction });
    if (!path) {
      this.router.transitionTo('/');
    }
    transition.abort();
    globals.location.replace(path);
  },
});
