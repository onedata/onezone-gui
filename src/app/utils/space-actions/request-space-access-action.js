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

// FIXME: valid context jsdoc / types
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

  /**
   * @override
   */
  i18nPrefix: 'utils.spaceActions.chooseSpaceToAdvertiseAction',

  /**
   * @override
   * @type {RequestSpaceAccessActionContext}
   */
  context: undefined,

  /**
   * @override
   */
  className: 'choose-space-to-advertise-trigger',

  /**
   * @override
   */
  icon: 'add-filled',

  spaceMarketplaceData: reads('context.spaceMarketplaceData'),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    await this.modalManager
      .show('spaces/request-space-access-modal', {
        onSubmit: async (requestData) => {
          await this.sendRequest(requestData);
          // FIXME: modal or notify with information about next steps (wait for access)
        },
        spaceMarketplaceData: this.spaceMarketplaceData,
      }).hiddenPromise;
    set(result, 'status', 'done');
    return result;
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
