/**
 * Dumps lambda revision to JSON file. Needs `atmLambda` and `revisionNumber`
 * passed in context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import { inject as service } from '@ember/service';
import { downloadData } from 'onedata-gui-common/utils/download-file';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.dumpAtmLambdaRevisionAction',

  /**
   * @override
   */
  className: 'dump-atm-lambda-revision-action-trigger',

  /**
   * @override
   */
  icon: 'browser-download',

  /**
   * @type {ComputedProperty<Models.AtmLambda>}
   */
  atmLambda: reads('context.atmLambda'),

  /**
   * @type {ComputedProperty<RevisionNumber>}
   */
  revisionNumber: reads('context.revisionNumber'),

  /**
   * @type {Function}
   */
  downloadData,

  /**
   * @type {Window}
   */
  _window: window,

  /**
   * @override
   */
  async onExecute() {
    const atmLambdaDump = await this.getAtmLambdaRevisionDump();
    this.downloadAtmLambdaRevisionDump(atmLambdaDump);
  },

  async getAtmLambdaRevisionDump() {
    return await this.workflowManager
      .getAtmLambdaDump(get(this.atmLambda, 'entityId'), this.revisionNumber);
  },

  downloadAtmLambdaRevisionDump(atmLambdaRevisionDump) {
    const revisionName =
      get(this.atmLambda, `revisionRegistry.${this.revisionNumber}.name`) ??
      this.revisionNumber;
    this.downloadData({
      dataString: JSON.stringify(atmLambdaRevisionDump, null, 2),
      fileName: `${revisionName}.json`,
      mimeType: 'application/json',
      _window: this._window,
    });
  },
});
