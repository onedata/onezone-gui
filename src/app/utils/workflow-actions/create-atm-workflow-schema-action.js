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
import createEmptyRevision from 'onezone-gui/utils/atm-workflow/atm-workflow-schema/create-empty-revision';

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
  async onExecute() {
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
    const rawAtmWorkflowSchemaToSave = Object.assign({
      initialRevision: {
        originalRevisionNumber: 1,
        schema: createEmptyRevision(),
      },
    }, rawAtmWorkflowSchema);

    return await workflowManager.createAtmWorkflowSchema(
      atmInventoryId,
      rawAtmWorkflowSchemaToSave
    );
  },
});
