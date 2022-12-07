/**
 * Opens modal with information about adding a space to advertising and selection which
 * space should be addded.
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { set } from '@ember/object';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

// FIXME: context is not needed
/**
 * @typedef {Object} ChooseSpaceToAdvertiseContext
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
   */
  className: 'choose-space-to-advertise-trigger',

  /**
   * @override
   */
  icon: 'cart',

  /**
   * @override
   */
  async onExecute() {
    const result = ActionResult.create();
    await this.modalManager
      .show('spaces/choose-space-to-advertise-modal', {
        onSubmit: async (spaceId) => await this.configureSpace(spaceId),
      }).hiddenPromise;
    set(result, 'status', 'done');
    return result;
  },

  async configureSpace(spaceId) {
    return this.router.transitionTo(
      'onedata.sidebar.content.aspect',
      'spaces',
      spaceId,
      'configuration',
    );
  },
});
