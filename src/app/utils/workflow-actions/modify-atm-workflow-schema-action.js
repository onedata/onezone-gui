/**
 * Modifies existing workflow schema. Needs `atmWorkflowSchema` (model) and
 * `atmWorkflowSchemaDiff` (changed fields) passed in context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { resolve } from 'rsvp';
import _ from 'lodash';

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

    const changedProperties = Object.keys(atmWorkflowSchemaDiff || {}).filter(key =>
      !_.isEqual(get(atmWorkflowSchema, key), get(atmWorkflowSchemaDiff, key))
    );

    const result = ActionResult.create();
    let promise;
    if (changedProperties.length > 0) {
      changedProperties.forEach(key =>
        set(atmWorkflowSchema, key, get(atmWorkflowSchemaDiff, key))
      );
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
