/**
 * Modifies existing workflow directory. Needs `workflowDirectory` (model) and
 * `workflowDirectoryDiff` (changed fields) passed in context.
 *
 * @module utils/workflow-actions/modify-workflow-directory-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { setProperties } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { resolve } from 'rsvp';

export default Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.modifyWorkflowDirectoryAction',

  /**
   * @type {ComputedProperty<Models.WorkflowDirectory>}
   */
  workflowDirectory: reads('context.workflowDirectory'),

  /**
   * @type {ComputedProperty<Object>}
   */
  workflowDirectoryDiff: reads('context.workflowDirectoryDiff'),

  /**
   * @override
   */
  onExecute() {
    const {
      workflowDirectory,
      workflowDirectoryDiff,
    } = this.getProperties(
      'workflowDirectory',
      'workflowDirectoryDiff',
    );

    const result = ActionResult.create();
    let promise;
    if (Object.keys(workflowDirectoryDiff).length > 0) {
      setProperties(workflowDirectory, workflowDirectoryDiff);
      promise = result.interceptPromise(
        workflowDirectory.save().then(() => workflowDirectory)
      ).catch(() => {
        workflowDirectory.rollbackAttributes();
      });
    } else {
      promise = result.interceptPromise(resolve(workflowDirectory));
    }

    return promise.then(() => result);
  },
});
