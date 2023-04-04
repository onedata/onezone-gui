/**
 * Shows necessary information about space membership request and allows to decide
 * if request should be accepted (grant access) or declined (reject request).
 *
 * This modal provides request validation, request information and controls for making
 * decision. Implementation of granting access or rejecting request with post-decision
 * actions should be injected.
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
import { promise, bool, and, not } from 'ember-awesome-macros';
import { htmlSafe } from '@ember/string';

/**
 * @typedef {Object} ConfirmJoinRequestModalOptions
 * @property {(userId: string) => Promise} onGrant Callback that should
 *   grant membership of the user with `userId` to the space, that the request is about.
 * @property {() => Promise} onReject Callback that should reject the membership access
 *   request.
 * @property {string} spaceId ID of space, for which the access will be considered.
 * @property {string} joinRequestId Space membership request ID.
 */

export default Component.extend(I18n, {
  tagName: '',

  i18nPrefix: 'components.modals.spaces.confirmJoinRequestModal',

  i18n: service(),
  spaceManager: service(),
  recordManager: service(),
  globalNotify: service(),
  modalManager: service(),
  alert: service(),

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

  //#region state

  isProcessing: false,

  //#endregion

  isMarketplaceEnabled: bool('spaceManager.marketplaceConfig.enabled'),

  /**
   * @typedef {Object} JoinRequestVerificationInfo
   * @property {'spaceNotFound'} [errorId]
   * @property {any} [error]
   */

  /**
   * @type {ComputedProperty<PromiseObject<JoinRequestVerificationInfo>>}
   */
  dataVerificationInfoProxy: promise.object(computed(
    'spaceId',
    'joinRequestId',
    'isMarketplaceEnabled',
    async function dataVerificationInfoProxy() {
      // this modal should be never opened when marketplace is disabled, but adding
      // check for unexpected situations
      if (!this.isMarketplaceEnabled) {
        throw new Error('marketplace disabled');
      }
      const spacePromise = this.spaceManager.getRecordById(this.spaceId);
      const requesterInfoPromise = this.spaceManager.getSpaceMembershipRequesterInfo(
        this.spaceId,
        this.joinRequestId,
      );
      let space;
      try {
        space = await spacePromise;
      } catch (spaceGetError) {
        switch (spaceGetError?.id) {
          case 'notFound':
            return {
              errorId: 'spaceNotFound',
                error: spaceGetError,
            };
          case 'forbidden':
            return {
              errorId: 'spaceForbidden',
                error: spaceGetError,
            };
          default:
            throw spaceGetError;
        }
      }
      let requesterInfo;
      try {
        requesterInfo = await requesterInfoPromise;
      } catch (requesterInfoGetError) {
        switch (requesterInfoGetError?.id) {
          case 'notFound':
            return {
              errorId: 'requesterInfoNotFound',
                error: requesterInfoGetError,
            };
          case 'forbidden':
            return {
              errorId: 'requesterInfoForbidden',
                error: requesterInfoGetError,
            };
          default:
            throw requesterInfoGetError;
        }
      }
      return {
        space,
        requesterInfo,
      };
    }
  )),

  dataVerificationInfo: reads('dataVerificationInfoProxy.content'),

  /**
   * @type {SpaceMembershipRequesterInfo|null}
   */
  requesterInfo: reads('dataVerificationInfoProxy.content.requesterInfo'),

  space: reads('dataVerificationInfoProxy.content.space'),

  /**
   * Make requesterInfo compatible with `join-image` component.
   * @type {ComputedProperty<Object>} User-like record.
   */
  joiningUserLikeRecord: computed('requesterInfo', function joiningUserLikeRecord() {
    return {
      entityId: this.requesterInfo.userId,
      name: this.requesterInfo.fullName,
      username: this.requesterInfo.username,
    };
  }),

  spaceProxy: promise.object(computed(
    'spaceId',
    async function spaceProxy() {
      return await this.spaceManager.getRecordById(this.spaceId);
    }
  )),

  /**
   * Execute implementation of granting space membership by request.
   * @type {(userId) => Promise}}
   */
  onGrant: reads('modalOptions.onGrant'),

  /**
   * Execute implementation of rejecting space membership request.
   * @type {() => Promise}
   */
  onReject: reads('modalOptions.onReject'),

  joinRequestId: reads('modalOptions.joinRequestId'),

  spaceId: reads('modalOptions.spaceId'),

  isValid: and(
    'dataVerificationInfoProxy.isFulfilled',
    not('dataVerificationInfo.errorId')
  ),

  userId: reads('requesterInfo.userId'),

  spaceName: reads('space.name'),

  isProceedButtonVisible: and('isMarketplaceEnabled', 'isValid'),

  isProceedAvailable: and('isValid', not('isProcessing')),

  actions: {
    async grant() {
      if (!this.isProceedAvailable) {
        return;
      }
      this.set('isProcessing', true);
      try {
        await this.onGrant(this.userId);
        this.modalManager.hide(this.modalId);
      } catch (error) {
        this.globalNotify.backendError(this.t('grantingSpaceAccess'), error);
      } finally {
        this.set('isProcessing', false);
      }
    },
    async reject() {
      if (!this.isProceedAvailable) {
        return;
      }
      this.set('isProcessing', true);
      try {
        await this.onReject();
        this.modalManager.hide(this.modalId);
      } catch (error) {
        this.globalNotify.backendError(this.t('rejectingSpaceAccess'), error);
      } finally {
        this.set('isProcessing', false);
      }
    },
    decideLater() {
      this.modalManager.hide(this.modalId);
      const text = this.t('decideLaterModal.bodyText');
      this.alert.info(htmlSafe(`<p>${text}</p>`), {
        header: this.t('decideLaterModal.header'),
      });
    },
  },
});
