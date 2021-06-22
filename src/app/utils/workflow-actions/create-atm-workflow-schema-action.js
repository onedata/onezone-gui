/**
 * Creates new workflow schema. Needs:
 * - `rawAtmWorkflowSchema` - will be used to create new workflow schema record,
 * - `atmInventory` - parent inventory for newly created workflow schema.
 *
 * @module utils/workflow-actions/create-atm-workflow-schema-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.createAtmWorkflowSchemaAction',

  /**
   * @type {ComputedProperty<Object>}
   */
  rawAtmWorkflowSchema: reads('context.rawAtmWorkflowSchema'),

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @override
   */
  onExecute() {
    const {
      rawAtmWorkflowSchema,
      atmInventory,
      workflowManager,
    } = this.getProperties(
      'rawAtmWorkflowSchema',
      'atmInventory',
      'workflowManager',
    );
    const atmInventoryId = get(atmInventory, 'entityId');

    const result = ActionResult.create();
    return result.interceptPromise(
      workflowManager.createAtmWorkflowSchema(atmInventoryId, rawAtmWorkflowSchema)
    ).then(() => result, () => result);
  },
});
