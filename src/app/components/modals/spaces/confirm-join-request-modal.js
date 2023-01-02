// FIXME: jsdoc

import Component from '@ember/component';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { promise, conditional, raw } from 'ember-awesome-macros';

// FIXME: document modalOptions

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

  verificationProxy: promise.object(computed(
    'joinRequestId',
    async function verificationProxy() {
      return await this.spaceManager.checkSpaceAccessRequest({
        joinRequestId: this.joinRequestId,
      });
    }
  )),

  joinRequestId: reads('modalOptions.joinRequestId'),

  isValid: reads('verificationProxy.content.isValid'),

  userId: reads('verificationProxy.content.userId'),

  spaceId: reads('verificationProxy.content.spaceId'),

  spaceName: reads('verificationProxy.content.spaceName'),

  // FIXME: check if user info is available by other user
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
      } catch (error) {
        this.globalNotify.backendError(this.t('grantingSpaceAccess'), error);
      }
    },
  },
});
