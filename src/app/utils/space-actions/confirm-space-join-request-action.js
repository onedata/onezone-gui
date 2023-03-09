/**
 * Opens modal with space join request confirmation and depending on the user decision,
 * grants or rejects space membership request. After successful grant, opens view of
 * newly added user to space.
 *
 * @author Jakub Liput
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { serializeAspectOptions } from 'onedata-gui-common/services/navigation-state';

/**
 * @typedef {Object} ConfirmSpaceJoinRequestActionContext
 * @property {string} spaceId
 * @property {string} requestId Space join request as used in
 *   `SpaceManager#getSpaceMembershipRequesterInfo`.
 */

export default Action.extend({
  modalManager: service(),
  router: service(),
  navigationState: service(),
  recordManager: service(),
  spaceManager: service(),

  // NOTE: This action is not intended to use as menu action, so it doesn't have
  // title, class and icon.

  /**
   * @override
   * @type {ConfirmSpaceJoinRequestActionContext}
   */
  context: undefined,

  requestId: reads('context.requestId'),

  spaceId: reads('context.spaceId'),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    const modalInstance = this.modalManager.show('spaces/confirm-join-request-modal', {
      spaceId: this.spaceId,
      joinRequestId: this.requestId,
      onGrant: this.onGrant.bind(this),
      onReject: this.onReject.bind(this),
    });
    await modalInstance.hiddenPromise;
    // currently there are no result status other than "done"
    set(result, 'status', 'done');
    return result;
  },

  /**
   * @param {string} userId Membership requesting userId.
   */
  async onGrant(userId) {
    await this.grantAccess();
    try {
      await this.onSuccessfulGrant(userId);
    } catch (postGrantHookError) {
      // ignore hook failure - it is not necessary for action to complete
      console.warn('Executing onGranted hook failed', postGrantHookError);
    }
  },

  async onReject() {
    await this.rejectAccess();
  },

  async grantAccess() {
    await this.spaceManager.resolveMarketplaceSpaceAccess(
      this.spaceId,
      this.requestId,
      true
    );
  },

  async rejectAccess() {
    await this.spaceManager.resolveMarketplaceSpaceAccess(
      this.spaceId,
      this.requestId,
      false
    );
  },

  async onSuccessfulGrant(userId) {
    await this.recordManager.reloadUserRecordList('space');
    if (!userId || !this.spaceId) {
      return;
    }
    if (
      this.navigationState.activeResource?.entityId === this.spaceId &&
      this.navigationState.activeAspect === 'members'
    ) {
      this.navigationState.changeRouteAspectOptions({
        member: userId,
      });
    } else {
      await this.router.transitionTo(
        'onedata.sidebar.content.aspect',
        'spaces',
        this.spaceId,
        'members', {
          queryParams: {
            options: serializeAspectOptions({
              member: userId,
            }),
          },
        }
      );
    }
  },
});
