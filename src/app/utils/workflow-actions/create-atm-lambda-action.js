/**
 * Creates new lambda. Needs:
 * - `rawAtmLambda` - will be used to create new lambda record,
 * - `atmInventory` - parent inventory for newly created lambda.
 *
 * @module utils/workflow-actions/create-atm-lambda-action
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
  i18nPrefix: 'utils.workflowActions.createAtmLambdaAction',

  /**
   * @type {ComputedProperty<Object>}
   */
  rawAtmLambda: reads('context.rawAtmLambda'),

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @override
   */
  onExecute() {
    const {
      rawAtmLambda,
      atmInventory,
      workflowManager,
    } = this.getProperties(
      'rawAtmLambda',
      'atmInventory',
      'workflowManager',
    );
    const atmInventoryId = get(atmInventory, 'entityId');

    const result = ActionResult.create();
    return result.interceptPromise(
      workflowManager.createAtmLambda(atmInventoryId, rawAtmLambda)
    ).then(() => result, () => result);
  },
});
