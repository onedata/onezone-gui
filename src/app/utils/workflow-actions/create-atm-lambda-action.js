/**
 * Creates new lambda. Needs:
 * - `initialRevision` - will be used to create new lambda record,
 * - `atmInventory` - parent inventory for newly created lambda.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.createAtmLambdaAction',

  /**
   * @type {ComputedProperty<AtmLambdaRevision>}
   */
  initialRevision: reads('context.initialRevision'),

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @override
   */
  async onExecute() {
    const {
      initialRevision,
      atmInventory,
      workflowManager,
    } = this.getProperties(
      'initialRevision',
      'atmInventory',
      'workflowManager',
    );
    const atmInventoryId = get(atmInventory, 'entityId');

    return await workflowManager.createAtmLambda(atmInventoryId, {
      revision: {
        originalRevisionNumber: 1,
        atmLambdaRevision: initialRevision,
      },
    });
  },
});
