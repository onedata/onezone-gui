/**
 * Creates new automation inventory. Needs `rawAtmInventory` - it will be used
 * to create new automation inventory record.
 *
 * @module utils/workflow-actions/create-atm-inventory-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { inject as service } from '@ember/service';
import { next } from '@ember/runloop';

export default Action.extend({
  workflowManager: service(),
  guiUtils: service(),
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.createAtmInventoryAction',

  /**
   * @type {ComputedProperty<Models.Object>}
   */
  rawAtmInventory: reads('context.rawAtmInventory'),

  /**
   * @override
   */
  onExecute() {
    const {
      rawAtmInventory,
      workflowManager,
      router,
      guiUtils,
    } = this.getProperties(
      'rawAtmInventory',
      'workflowManager',
      'router',
      'guiUtils'
    );

    const result = ActionResult.create();
    return result.interceptPromise(workflowManager.createAtmInventory(rawAtmInventory))
      .then(() => {
        next(() => {
          router.transitionTo(
            'onedata.sidebar.content',
            'inventories',
            guiUtils.getRoutableIdFor(get(result, 'result'))
          );
        });
      })
      .then(() => result, () => result);
  },
});
