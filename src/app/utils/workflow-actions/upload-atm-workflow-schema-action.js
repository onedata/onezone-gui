/**
 * Uploads workflow schema from JSON file. Needs `atmInventory` passed in context.
 *
 * @module utils/workflow-actions/upload-atm-workflow-schema-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import Action from 'onedata-gui-common/utils/action';
import { inject as service } from '@ember/service';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { resolve } from 'rsvp';

export default Action.extend({
  workflowManager: service(),
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.uploadAtmWorkflowSchemaAction',

  /**
   * @override
   */
  className: 'upload-atm-workflow-schema-action-trigger',

  /**
   * @override
   */
  icon: 'browser-upload',

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @override
   */
  async onExecute() {
    const {
      atmInventory,
      modalManager,
    } = this.getProperties(
      'atmInventory',
      'modalManager'
    );

    const result = ActionResult.create();
    await modalManager.show('upload-atm-workflow-schema-modal', {
      atmInventory,
      onSubmit: (data) => result.interceptPromise(resolve(data)),
    }).hiddenPromise;

    result.cancelIfPending();
    return result;
  },
});
