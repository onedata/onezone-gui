/**
 * Opens modal with space request message to send.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { htmlSafe } from '@ember/string';

/**
 * @typedef {Object} RequestSpaceAccessActionContext
 * @property {SpaceMarketplaceModel} spaceMarketplaceData
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

  /**
   * @type {{ spaceId: string, name: string }}
   */
  spaceMarketplaceData: reads('context.spaceMarketplaceData'),

  /**
   * @override
   */
  notifyResult() {
    // failure will be notified in onExecute -> onSubmit; no need to notify success
  },

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    const modalInstance = this.modalManager
      .show('spaces/request-space-access-modal', {
        hideAfterSubmit: false,
        /** @param {SpaceAccessRequestMessageData} requestData */
        onSubmit: async (requestData) => {
          try {
            await result.interceptPromise(this.sendRequest(requestData));
            try {
              await this.reloadSpaceMembershipRequestsInfo();
            } catch (error) {
              // reloading is not critical, so just print error on console and continue
              console.warn('Reloading SpaceMembershipRequestsInfo failed', error);
            }
            this.showSuccessInfo(requestData);
            this.modalManager.hide(modalInstance.id);
          } catch {
            this.notifyFailure(result);
          }
        },
        spaceMarketplaceData: this.spaceMarketplaceData,
      });
    await modalInstance.hiddenPromise;
    result.cancelIfPending();
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

  /**
   *
   * @param {SpaceAccessRequestMessageData} requestData
   * @returns {Promise}
   */
  async sendRequest(requestData) {
    return this.spaceManager.requestSpaceAccess(requestData);
  },

  /**
   * @returns {Promise<Models.SpaceMembershipRequestsInfo>}
   */
  async reloadSpaceMembershipRequestsInfo() {
    return this.spaceManager.getSpaceMembershipRequestsInfo(true);
  },
});
