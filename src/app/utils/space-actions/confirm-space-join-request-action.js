/**
 * Opens modal with space join request confirmation.
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
 * @property {string} requestId Space join request as used in
 *   `SpaceManager#checkSpaceAccessRequest`.
 */

export default Action.extend({
  modalManager: service(),
  router: service(),
  navigationState: service(),

  // NOTE: This action is not intended to use as menu action, so it doesn't have
  // title, class and icon.

  /**
   * @override
   * @type {ConfirmSpaceJoinRequestActionContext}
   */
  context: undefined,

  requestId: reads('context.requestId'),

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    const modalInstance = this.modalManager.show('spaces/confirm-join-request-modal', {
      joinRequestId: this.requestId,
      onConfirmed: ({ userId, spaceId }) => {
        set(result, 'status', 'done');
        if (!userId || !spaceId) {
          return;
        }
        if (
          this.navigationState.activeResource?.entityId === spaceId &&
          this.navigationState.activeAspect === 'members'
        ) {
          this.navigationState.changeRouteAspectOptions({
            member: userId,
            action: null,
            joinRequestId: null,
          });
        } else {
          this.router.transitionTo(
            'onedata.sidebar.content.aspect',
            'spaces',
            spaceId,
            'members', {
              queryParams: {
                options: serializeAspectOptions({
                  member: userId,
                }),
              },
            }
          );
        }

        // TODO: VFS-10252 check how it behaves when space will be pushed to list
      },
    });
    await modalInstance.hiddenPromise;
    result.cancelIfPending();
    return result;
  },
});
