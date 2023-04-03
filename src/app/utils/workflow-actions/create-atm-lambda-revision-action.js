/**
 * Creates new lambda revision. Needs `atmLambda` and `revisionContent`.
 * Passes (via result) a number of the created revision.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import { inject as service } from '@ember/service';
import getNextFreeRevisionNumber from 'onedata-gui-common/utils/revisions/get-next-free-revision-number';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.createAtmLambdaRevisionAction',

  /**
   * @type {ComputedProperty<Models.AtmLambda>}
   */
  atmLambda: reads('context.atmLambda'),

  /**
   * @type {ComputedProperty<AtmLambdaRevision>}
   */
  revisionContent: reads('context.revisionContent'),

  /**
   * @override
   */
  async onExecute() {
    const {
      atmLambda,
      revisionContent,
      workflowManager,
    } = this.getProperties(
      'atmLambda',
      'revisionContent',
      'workflowManager'
    );
    const revisionNumber = getNextFreeRevisionNumber(
      Object.keys(get(atmLambda, 'revisionRegistry') || {})
    );

    await workflowManager.createAtmLambdaRevision(
      get(atmLambda, 'entityId'),
      revisionNumber,
      revisionContent
    );
    return revisionNumber;
  },
});
