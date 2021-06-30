/**
 * Dumps workflow schema to JSON file. Needs `atmWorkflowSchema` passed in context.
 *
 * @module utils/workflow-actions/dump-atm-workflow-schema-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { inject as service } from '@ember/service';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.dumpAtmWorkflowSchemaAction',

  /**
   * @override
   */
  className: 'dump-atm-workflow-schema-action-trigger',

  /**
   * @override
   */
  icon: 'browser-download',

  /**
   * @type {ComputedProperty<Models.AtmWorkflowSchema>}
   */
  atmWorkflowSchema: reads('context.atmWorkflowSchema'),

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @override
   */
  onExecute() {
    const result = ActionResult.create();
    const getSchemaDumpPromise = this.getAtmWorkflowSchemaDump();

    getSchemaDumpPromise.then(atmWorkflowSchemaDump =>
      this.downloadAtmWorkflowSchemaDump(atmWorkflowSchemaDump)
    );

    return result.interceptPromise(getSchemaDumpPromise)
      .then(() => result, () => result);
  },

  async getAtmWorkflowSchemaDump() {
    const {
      atmWorkflowSchema,
      workflowManager,
    } = this.getProperties(
      'atmWorkflowSchema',
      'workflowManager',
    );

    return await workflowManager
      .getAtmWorkflowSchemaDump(get(atmWorkflowSchema, 'entityId'));
  },

  downloadAtmWorkflowSchemaDump(atmWorkflowSchemaDump) {
    const {
      atmWorkflowSchema,
      _window,
    } = this.getProperties('atmWorkflowSchema', '_window');

    const blobToDownload = new Blob([JSON.stringify(atmWorkflowSchemaDump, null, 2)], {
      type: 'application/json',
      name: `${get(atmWorkflowSchema, 'name')}.json`,
    });
    const downloadUrl = _window.URL.createObjectURL(blobToDownload);

    const link = _window.document.createElement('a');
    link.dataType = 'json';
    link.href = downloadUrl;
    link.download = `${get(atmWorkflowSchema, 'name')}.json`;
    link.target = '_blank';
    link.dispatchEvent(new MouseEvent('click'));
  },
});
