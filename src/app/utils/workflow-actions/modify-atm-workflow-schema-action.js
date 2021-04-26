/**
 * Modifies existing workflow schema. Needs `atmWorkflowSchema` (model) and
 * `atmWorkflowSchemaDiff` (changed fields) passed in context.
 *
 * @module utils/workflow-actions/modify-atm-workflow-schema-action
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
  i18nPrefix: 'utils.workflowActions.modifyAtmWorkflowSchemaAction',

  /**
   * @type {ComputedProperty<Models.AtmWorkflowSchema>}
   */
  atmWorkflowSchema: reads('context.atmWorkflowSchema'),

  /**
   * @type {ComputedProperty<Object>}
   */
  atmWorkflowSchemaDiff: reads('context.atmWorkflowSchemaDiff'),

  /**
   * @override
   */
  onExecute() {
    const {
      atmWorkflowSchema,
      atmWorkflowSchemaDiff,
    } = this.getProperties(
      'atmWorkflowSchema',
      'atmWorkflowSchemaDiff',
    );

    const result = ActionResult.create();
    let promise;
    if (Object.keys(atmWorkflowSchemaDiff).length > 0) {
      setProperties(atmWorkflowSchema, atmWorkflowSchemaDiff);
      promise = result.interceptPromise(
        atmWorkflowSchema.save().then(() => atmWorkflowSchema)
      ).catch(() => {
        atmWorkflowSchema.rollbackAttributes();
      });
    } else {
      promise = result.interceptPromise(resolve(atmWorkflowSchema));
    }

    return promise.then(() => result);
  },
});
