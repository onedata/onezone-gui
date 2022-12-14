/**
 * Opens modal with information about adding a space to advertising and selection which
 * space should be addded.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { htmlSafe } from '@ember/string';

/**
 * @typedef {Object} RequestSpaceAccessActionContext
 * @property {SpaceMarketplaceModel} spaceMarketplaceData
 */

/**
 * @typedef {Object} SpaceAccessRequestMessageData
 * @property {string} message
 * @property {string} email
 * @property {string} spaceId
 */

export default Action.extend({
  modalManager: service(),
  router: service(),
  spaceManager: service(),
  globalNotify: service(),
  alert: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.spaceActions.requestSpaceAccessAction',

  /**
   * @override
   * @type {RequestSpaceAccessActionContext}
   */
  context: undefined,

  /**
   * @override
   */
  className: 'request-space-access-trigger',

  /**
   * @override
   */
  icon: 'cart',

  spaceMarketplaceData: reads('context.spaceMarketplaceData'),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    const modalInstance = this.modalManager
      .show('spaces/request-space-access-modal', {
        hideAfterSubmit: false,
        onSubmit: async (requestData) => {
          try {
            await this.sendRequest(requestData);
            this.showSuccessInfo(requestData);
            this.modalManager.hide(modalInstance.id);
            set(result, 'status', 'done');
          } catch (error) {
            this.showErrorInfo(error);
            set(result, 'status', 'error');
          }
        },
        onHide: () => {
          set(result, 'status', 'cancelled');
        },
        spaceMarketplaceData: this.spaceMarketplaceData,
      });
    await modalInstance.hiddenPromise;
    return result;
  },

  showSuccessInfo(requestData) {
    const text = this.t('requestSuccess.text', {
      email: requestData.email,
    });
    this.alert.success(htmlSafe(`<p>${text}</p>`), {
      header: this.t('requestSuccess.header'),
    });
  },

  showErrorInfo(error) {
    this.globalNotify.backendError(
      this.t('sendingRequest'),
      error
    );
  },

  /**
   *
   * @param {SpaceAccessRequestMessageData} requestData
   * @returns {Promise}
   */
  async sendRequest(requestData) {
    return this.spaceManager.requestSpaceAccess(requestData);
  },
});
