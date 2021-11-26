/**
 * Removes workflow schema revision.
 *
 * @module utils/workflow-actions/remove-atm-workflow-schema-revision-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

export default Action.extend({
  workflowManager: service(),
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.removeAtmWorkflowSchemaRevisionAction',

  /**
   * @override
   */
  icon: 'x',

  /**
   * @override
   */
  className: 'remove-atm-workflow-schema-revision-action-trigger',

  /**
   * @type {ComputedProperty<Models.AtmWorkflowSchema>}
   */
  atmWorkflowSchema: reads('context.atmWorkflowSchema'),

  /**
   * @type {ComputedProperty<Number>}
   */
  revisionNumber: reads('context.revisionNumber'),

  /**
   * @override
   */
  onExecute() {
    const {
      atmWorkflowSchema,
      revisionNumber,
      modalManager,
    } = this.getProperties(
      'atmWorkflowSchema',
      'revisionNumber',
      'modalManager'
    );

    const result = ActionResult.create();
    return modalManager
      .show('question-modal', {
        headerIcon: 'sign-warning-rounded',
        headerText: this.t('modalHeader'),
        descriptionParagraphs: [{
          text: this.t('modalDescription', {
            atmWorkflowSchemaName: get(atmWorkflowSchema, 'name'),
            revisionNumber: revisionNumber,
          }),
        }],
        yesButtonText: this.t('modalYes'),
        yesButtonClassName: 'btn-danger',
        onSubmit: () =>
          result.interceptPromise(this.removeAtmWorkflowSchemaRevision()),
      }).hiddenPromise
      .then(() => {
        result.cancelIfPending();
        return result;
      });
  },

  async removeAtmWorkflowSchemaRevision() {
    const {
      workflowManager,
      atmWorkflowSchema,
      revisionNumber,
    } = this.getProperties(
      'workflowManager',
      'atmWorkflowSchema',
      'revisionNumber'
    );

    await workflowManager.removeAtmWorkflowSchemaRevision(
      get(atmWorkflowSchema, 'entityId'),
      revisionNumber
    );
  },
});
