/**
 * Creates new lambda function. Needs:
 * - `rawLambdaFunction` - will be used to create new lambda function record,
 * - `workflowDirectory` - parent directory for newly created lambda function.
 *
 * @module utils/workflow-actions/create-lambda-function-action
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
  i18nPrefix: 'utils.workflowActions.createLambdaFunctionAction',

  /**
   * @type {ComputedProperty<Object>}
   */
  rawLambdaFunction: reads('context.rawLambdaFunction'),

  /**
   * @type {ComputedProperty<Models.WorkflowDirectory>}
   */
  workflowDirectory: reads('context.workflowDirectory'),

  /**
   * @override
   */
  onExecute() {
    const {
      rawLambdaFunction,
      workflowDirectory,
      workflowManager,
    } = this.getProperties(
      'rawLambdaFunction',
      'workflowDirectory',
      'workflowManager',
    );
    const workflowDirectoryId = get(workflowDirectory, 'entityId');

    const result = ActionResult.create();
    return result.interceptPromise(
      workflowManager.createLambdaFunction(workflowDirectoryId, rawLambdaFunction)
    ).then(() => result, () => result);
  },
});
