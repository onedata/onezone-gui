/**
 * Opens modal with information about adding a space to advertising and selection which
 * space should be addded.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
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
            await this.configureSpace(spaceId);
            this.modalManager.hide(modalInstance.id);
            set(result, 'status', 'done');
          } catch (error) {
            this.showErrorInfo(error);
            set(result, 'status', 'error');
          }
        },
      });
    await modalInstance.hiddenPromise;
    return result;
  },

  showErrorInfo(error) {
    this.globalNotify.backendError(
      this.t('openingSpaceConfiguration'),
      error
    );
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
