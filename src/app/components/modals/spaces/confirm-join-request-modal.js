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
import { promise, bool } from 'ember-awesome-macros';

/**
 * @typedef {Object} ConfirmJoinRequestModalOptions
 * @property {({ userId: string, spaceId: string }) => void} onConfirmed Callback invoked
 *   after access granting method has been successfully resolved.
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

  /**
   * @type {PromiseObject<SpaceMembershipRequesterInfo>}
   */
  requesterInfoProxy: promise.object(computed(
    'joinRequestId',
    async function requesterInfoProxy() {
      return await this.spaceManager.getSpaceMembershipRequesterInfo(
        this.spaceId,
        this.joinRequestId,
      );
    }
  )),

  /**
   * @type {SpaceMembershipRequesterInfo|null}
   */
  requesterInfo: reads('requesterInfoProxy.content'),

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

  space: reads('spaceProxy.content'),

  /**
   * @type {({ userId: string, spaceId: string }) => void}
   */
  onConfirmed: reads('modalOptions.onConfirmed'),

  joinRequestId: reads('modalOptions.joinRequestId'),

  spaceId: reads('modalOptions.spaceId'),

  isValid: bool('requesterInfoProxy.isFulfilled'),

  userId: reads('requesterInfo.userId'),

  spaceName: reads('space.name'),

  isProceedButtonVisible: reads('isValid'),

  isProceedAvailable: reads('isValid'),

  async grantAccess() {
    this.spaceManager.resolveMarketplaceSpaceAccess(
      this.spaceId,
      this.joinRequestId,
      true
    );
  },

  async rejectAccess() {
    this.spaceManager.resolveMarketplaceSpaceAccess(
      this.spaceId,
      this.joinRequestId,
      false
    );
  },

  actions: {
    async grant() {
      if (!this.isProceedAvailable) {
        return;
      }
      try {
        await this.grantAccess();
        this.modalManager.hide(this.modalId);
        this.onConfirmed({
          spaceId: this.spaceId,
          userId: this.userId,
        });
      } catch (error) {
        this.globalNotify.backendError(this.t('grantingSpaceAccess'), error);
      }
    },
    async reject() {
      if (!this.isProceedAvailable) {
        return;
      }
      try {
        await this.grantAccess();
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
