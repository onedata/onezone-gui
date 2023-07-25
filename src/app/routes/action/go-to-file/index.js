/**
 * Redirects to the default file action for go-to-file.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { defaultFileAction } from 'onezone-gui/utils/url-action-handlers/go-to-file';

export default Route.extend({
  router: service(),

  beforeModel() {
    this.router.transitionTo(
      'action.go-to-file.file-action',
      this.modelFor('action.go-to-file').fileId,
      defaultFileAction,
    );
  },
});
