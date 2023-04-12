/**
 * Opens modal with information about adding a space to advertising and selection which
 * space should be added.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

export default Action.extend({
  modalManager: service(),
  router: service(),
  gloalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.spaceActions.chooseSpaceToAdvertiseAction',

  /**
   * @override
   */
  className: 'choose-space-to-advertise-trigger',

  /**
   * @override
   */
  icon: 'add-filled',

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    const modalInstance = this.modalManager
      .show('spaces/choose-space-to-advertise-modal', {
        hideAfterSubmit: false,
        onSubmit: async (spaceId) => {
          try {
            await result.interceptPromise(this.configureSpace(spaceId));
            this.modalManager.hide(modalInstance.id);
          } catch {
            this.notifyFailure(result);
          }
        },
      });
    await modalInstance.hiddenPromise;
    return result;
  },

  async configureSpace(spaceId) {
    return this.router.transitionTo(
      'onedata.sidebar.content.aspect',
      'spaces',
      spaceId,
      'configuration',
    );
  },
});
