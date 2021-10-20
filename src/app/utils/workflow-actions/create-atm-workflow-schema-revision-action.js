/**
 * Creates new workflow schema revision. Needs `atmWorkflowSchema` and (optional)
 * `originRevisionNumber`. If the latter is provided, then new revision is created
 * based on a pointed revision instead of the last one. Passes (via result) a number
 * of the created revision.
 *
 * @module utils/workflow-actions/create-atm-workflow-schema-revision-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get, computed } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import { inject as service } from '@ember/service';
import { conditional } from 'ember-awesome-macros';
import computedT from 'onedata-gui-common/utils/computed-t';
import sortRevisionNumbers from 'onezone-gui/utils/atm-workflow/sort-revision-numbers';
import getNextFreeRevisionNumber from 'onezone-gui/utils/atm-workflow/get-next-free-revision-number';
import createEmptyRevision from 'onezone-gui/utils/atm-workflow/atm-workflow-schema/create-empty-revision';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.createAtmWorkflowSchemaRevisionAction',

  /**
   * @override
   */
  className: 'create-atm-workflow-schema-revision-action-trigger',

  /**
   * @override
   */
  icon: 'plus',

  /**
   * @override
   */
  title: conditional(
    'originRevisionNumber',
    computedT('title.redesign'),
    computedT('title.new')
  ),

  /**
   * @type {ComputedProperty<Models.AtmWorkflowSchema>}
   */
  atmWorkflowSchema: reads('context.atmWorkflowSchema'),

  /**
   * @type {ComputedProperty<Number|undefined>}
   */
  originRevisionNumber: reads('context.originRevisionNumber'),

  /**
   * @type {ComputedProperty<Number|undefined>}
   */
  normalizedOriginRevisionNumber: computed(
    'originRevisionNumber',
    'atmWorkflowSchema.revisionRegistry',
    function normalizedOriginRevisionNumber() {
      const originRevisionNumber = this.get('originRevisionNumber');
      const revisionRegistry = this.get('atmWorkflowSchema.revisionRegistry') || {};

      if (originRevisionNumber in revisionRegistry) {
        return originRevisionNumber;
      } else {
        const sortedRevisionNumbers = sortRevisionNumbers(Object.keys(revisionRegistry));
        // return latest revision number (or undefined)
        return sortedRevisionNumbers[sortedRevisionNumbers.length - 1];
      }
    }
  ),

  /**
   * @override
   */
  async onExecute() {
    const {
      atmWorkflowSchema,
      normalizedOriginRevisionNumber,
    } = this.getProperties(
      'atmWorkflowSchema',
      'normalizedOriginRevisionNumber',
    );

    let newRevision;
    const originRevision = normalizedOriginRevisionNumber &&
      get(atmWorkflowSchema, `revisionRegistry.${normalizedOriginRevisionNumber}`);
    if (originRevision) {
      newRevision = Object.assign({}, originRevision, { state: 'draft' });
    } else {
      newRevision = createEmptyRevision();
    }

    return await this.persistNewRevision(newRevision);
  },

  /**
   * @param {Object} revision
   * @returns {Promise<Number>} revision number
   */
  async persistNewRevision(revision) {
    const {
      atmWorkflowSchema,
      workflowManager,
    } = this.getProperties(
      'atmWorkflowSchema',
      'workflowManager'
    );
    const revisionNumber = getNextFreeRevisionNumber(
      Object.keys(get(atmWorkflowSchema, 'revisionRegistry') || {})
    );

    await workflowManager.saveAtmWorkflowSchemaRevision(
      get(atmWorkflowSchema, 'entityId'),
      revisionNumber,
      revision
    );
    return revisionNumber;
  },
});
