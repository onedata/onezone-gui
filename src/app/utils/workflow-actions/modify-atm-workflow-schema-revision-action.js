/**
 * Modifies existing workflow schema revision. Needs `atmWorkflowSchema`, `revisionNumber`
 * and `revisionDiff` (changed fields) passed in context.
 *
 * @module utils/workflow-actions/modify-atm-workflow-schema-revision-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get, setProperties } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { resolve } from 'rsvp';
import _ from 'lodash';
import { inject as service } from '@ember/service';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.modifyAtmWorkflowSchemaRevisionAction',

  /**
   * @type {ComputedProperty<Models.AtmWorkflowSchema>}
   */
  atmWorkflowSchema: reads('context.atmWorkflowSchema'),

  /**
   * @type {ComputedProperty<Number>}
   */
  revisionNumber: reads('context.revisionNumber'),

  /**
   * @type {ComputedProperty<Object>}
   */
  revisionDiff: reads('context.revisionDiff'),

  /**
   * @override
   */
  onExecute() {
    const {
      atmWorkflowSchema,
      revisionNumber,
      revisionDiff,
    } = this.getProperties(
      'atmWorkflowSchema',
      'revisionNumber',
      'revisionDiff',
    );
    const result = ActionResult.create();

    const revision = atmWorkflowSchema && revisionNumber &&
      get(atmWorkflowSchema, `revisionRegistry.${revisionNumber}`);
    if (!revision) {
      setProperties(result, {
        status: 'failed',
        error: { id: 'notFound' },
      });
      return resolve(result);
    }

    const changedProperties = Object.keys(revisionDiff || {}).filter(key =>
      !_.isEqual(revision[key], revisionDiff[key])
    );

    let promise;
    if (changedProperties.length > 0) {
      const updatedRevision = Object.assign({}, revision);
      changedProperties.forEach(key =>
        updatedRevision[key] = revisionDiff[key]
      );
      promise = result.interceptPromise(this.saveRevision(updatedRevision));
    } else {
      promise = result.interceptPromise(resolve(atmWorkflowSchema));
    }

    return promise.then(() => result, () => result);
  },

  async saveRevision(revision) {
    const {
      atmWorkflowSchema,
      revisionNumber,
      workflowManager,
    } = this.getProperties(
      'atmWorkflowSchema',
      'revisionNumber',
      'workflowManager'
    );

    await workflowManager.saveAtmWorkflowSchemaRevision(
      get(atmWorkflowSchema, 'entityId'),
      revisionNumber,
      revision
    );
  },
});
