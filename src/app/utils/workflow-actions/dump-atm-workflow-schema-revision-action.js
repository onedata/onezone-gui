/**
 * Dumps workflow schema revision to JSON file. Needs `atmWorkflowSchema` and
 * `revisionNumber` passed in context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { inject as service } from '@ember/service';
import { downloadData } from 'onedata-gui-common/utils/download-file';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.dumpAtmWorkflowSchemaRevisionAction',

  /**
   * @override
   */
  className: 'dump-atm-workflow-schema-revision-action-trigger',

  /**
   * @override
   */
  icon: 'browser-download',

  /**
   * @type {ComputedProperty<Models.AtmWorkflowSchema>}
   */
  atmWorkflowSchema: reads('context.atmWorkflowSchema'),

  /**
   * @type {ComputedProperty<RevisionNumber>}
   */
  revisionNumber: reads('context.revisionNumber'),

  /**
   * @type {Function}
   */
  _downloadData: downloadData,

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @override
   */
  onExecute() {
    const result = ActionResult.create();
    const getSchemaDumpPromise = this.getAtmWorkflowSchemaRevisionDump();

    getSchemaDumpPromise.then(atmWorkflowSchemaDump =>
      this.downloadAtmWorkflowSchemaRevisionDump(atmWorkflowSchemaDump)
    );

    return result.interceptPromise(getSchemaDumpPromise)
      .then(() => result, () => result);
  },

  async getAtmWorkflowSchemaRevisionDump() {
    const {
      atmWorkflowSchema,
      revisionNumber,
      workflowManager,
    } = this.getProperties(
      'atmWorkflowSchema',
      'revisionNumber',
      'workflowManager',
    );

    return await workflowManager
      .getAtmWorkflowSchemaDump(get(atmWorkflowSchema, 'entityId'), revisionNumber);
  },

  downloadAtmWorkflowSchemaRevisionDump(atmWorkflowSchemaRevisionDump) {
    const {
      atmWorkflowSchema,
      _downloadData,
      _window,
    } = this.getProperties('atmWorkflowSchema', '_downloadData', '_window');

    _downloadData({
      dataString: JSON.stringify(atmWorkflowSchemaRevisionDump, null, 2),
      fileName: `${get(atmWorkflowSchema, 'name')}.json`,
      mimeType: 'application/json',
      _window,
    });
  },
});
