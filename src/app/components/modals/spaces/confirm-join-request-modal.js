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
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { promise, bool, and, not } from 'ember-awesome-macros';
import { htmlSafe } from '@ember/string';
import insufficientPrivilegesMessage from 'onedata-gui-common/utils/i18n/insufficient-privileges-message';
import findRouteInfo from 'onedata-gui-common/utils/find-route-info';

/**
 * @typedef {Object} ConfirmJoinRequestModalOptions
 * @property {(userId: string) => Promise} onGrant Callback that should
 *   grant membership of the user with `userId` to the space, that the request is about.
 * @property {() => Promise} onReject Callback that should reject the membership access
 *   request.
 * @property {string} spaceId ID of space, for which the access will be considered.
 * @property {string} joinRequestId Space membership request ID.
 */

/**
 * @typedef {Object} JoinRequestVerificationInfo
 * @property {Models.Space} [space] If requests complete successfully, the space that
 *   the request is about.
 * @property { SpaceMembershipRequesterInfo } [requesterInfo] If requests complete
 *   successfully, info about user requesting membership.
 * @property {
 *   'spaceNotFound' |
 *   'spaceForbidden' |
 *   'requesterInfoNotFound' |
 *   'requesterInfoForbidden' |
 *   'requesterInfoRelationAlreadyExist'
 * } [errorId] One of known request errors to show special message.
 * @property {any} [error] Error object if the known error is catched.
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
            return ({
              errorId: 'spaceNotFound',
              error: spaceGetError,
            });
          case 'forbidden':
            return ({
              errorId: 'spaceForbidden',
              error: spaceGetError,
            });
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
            return ({
              errorId: 'requesterInfoNotFound',
              error: requesterInfoGetError,
            });
          case 'forbidden':
            return ({
              errorId: 'requesterInfoForbidden',
              error: requesterInfoGetError,
            });
          case 'relationAlreadyExists':
            return ({
              errorId: 'requesterInfoRelationAlreadyExist',
              error: requesterInfoGetError,
            });
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
  requesterInfo: reads('dataVerificationInfo.requesterInfo'),

  space: reads('dataVerificationInfo.space'),

  /**
   * Make requesterInfo compatible with `join-image` component.
   * @type {ComputedProperty<Object>} User-like record.
   */
  joiningUserLikeRecord: computed('requesterInfo', function joiningUserLikeRecord() {
    return {
      entityId: this.requesterInfo.userId,
      name: this.requesterInfo.fullName,
      fullName: this.requesterInfo.fullName,
      username: this.requesterInfo.username,
    };
  }),

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

  grantButtonDisabledTip: computed(
    'space.privileges.{manageInMarketplace,addUser}',
    function grantButtonDisabledTip() {
      if (!this.space) {
        return;
      }
      if (!this.space.privileges.manageInMarketplace || !this.space.privileges.addUser) {
        return insufficientPrivilegesMessage({
          i18n: this.i18n,
          modelName: 'space',
          privilegeFlag: ['space_manage_in_marketplace', 'space_add_user'],
        });
      }
    }
  ),

  rejectButtonDisabledTip: computed(
    'space.privileges.manageInMarketplace',
    function rejectButtonDisabledTip() {
      if (!this.space) {
        return;
      }
      if (!this.space.privileges.manageInMarketplace) {
        return insufficientPrivilegesMessage({
          i18n: this.i18n,
          modelName: 'space',
          privilegeFlag: 'space_manage_in_marketplace',
        });
      }
    }
  ),

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
    shouldCloseOnTransition(transitionInfo) {
      if (transitionInfo.type !== 'transition') {
        return;
      }
      const transition = transitionInfo.data;

      const resourceType =
        findRouteInfo(transition, 'onedata.sidebar')?.attributes.resourceType;
      const resource =
        findRouteInfo(transition, 'onedata.sidebar.content')?.attributes.resource;
      const resourceId = resource && get(resource, 'entityId');
      const aspect =
        findRouteInfo(transition, 'onedata.sidebar.content.aspect')?.attributes.aspectId;

      return !(
        resourceType === 'spaces' &&
        resourceId === this.spaceId &&
        aspect === 'members'
      );
    },
  },
});
