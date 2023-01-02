/**
 * Verifies, shows info and allows to confirm access request to space made by some user
 * using spaces marketplace.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { promise, conditional, raw } from 'ember-awesome-macros';

/**
 * @typedef {Object} ConfirmJoinRequestModalOptions
 * @property {({ userId: string, spaceId: string }) => void} onConfirmed Callback invoked
 *   after access granting method has been successfully resolved.
 * @property {string} joinRequestId Request ID used in granting access to space used in
 *   `spaceManager#grantSpaceAccess`.
 */

export default Component.extend(I18n, {
  tagName: '',

  i18nPrefix: 'components.modals.spaces.confirmJoinRequestModal',

  i18n: service(),
  spaceManager: service(),
  recordManager: service(),
  globalNotify: service(),
  modalManager: service(),

  closeButtonType: conditional(
    'isValid',
    raw('cancel'),
    raw('close')
  ),

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {ConfirmJoinRequestModalOptions}
   */
  modalOptions: undefined,

  verificationProxy: promise.object(computed(
    'joinRequestId',
    async function verificationProxy() {
      return await this.spaceManager.checkSpaceAccessRequest({
        joinRequestId: this.joinRequestId,
      });
    }
  )),

  /**
   * @type {({ userId: string, spaceId: string }) => void}
   */
  onConfirmed: reads('modalOptions.onConfirmed'),

  joinRequestId: reads('modalOptions.joinRequestId'),

  isValid: reads('verificationProxy.content.isValid'),

  userId: reads('verificationProxy.content.userId'),

  spaceId: reads('verificationProxy.content.spaceId'),

  spaceName: reads('verificationProxy.content.spaceName'),

  userName: reads('userProxy.content.name'),

  // TODO: VFS-10252 check if user info will be available by other user
  userProxy: promise.object(computed('userId', async function userProxy() {
    if (!this.userId) {
      return null;
    }
    return this.recordManager.getRecordById('user', this.userId);
  })),

  isProceedButtonVisible: reads('isValid'),

  isProceedAvailable: reads('isValid'),

  actions: {
    async confirm() {
      if (!this.isProceedAvailable) {
        return;
      }
      try {
        await this.spaceManager.grantSpaceAccess(this.joinRequestId);
        this.modalManager.hide(this.modalId);
        this.onConfirmed({
          spaceId: this.spaceId,
          userId: this.userId,
        });
      } catch (error) {
        this.globalNotify.backendError(this.t('grantingSpaceAccess'), error);
      }
    },
  },
});
