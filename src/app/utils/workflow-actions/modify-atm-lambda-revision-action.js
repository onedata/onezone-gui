/**
 * Modifies existing lambda revision. Needs `atmLambda`, `revisionNumber`
 * and `revisionDiff` (changed fields) passed in context.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import _ from 'lodash';
import Action from 'onedata-gui-common/utils/action';

export default Action.extend({
  workflowManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.workflowActions.modifyAtmLambdaRevisionAction',

  /**
   * @type {ComputedProperty<Models.AtmLambda>}
   */
  atmLambda: reads('context.atmLambda'),

  /**
   * @type {ComputedProperty<RevisionNumber>}
   */
  revisionNumber: reads('context.revisionNumber'),

  /**
   * @type {ComputedProperty<Object>}
   */
  revisionDiff: reads('context.revisionDiff'),

  /**
   * @override
   */
  async onExecute() {
    const {
      atmLambda,
      revisionNumber,
      revisionDiff,
      workflowManager,
    } = this.getProperties(
      'atmLambda',
      'revisionNumber',
      'revisionDiff',
      'workflowManager'
    );

    const revision = atmLambda && revisionNumber &&
      get(atmLambda, `revisionRegistry.${revisionNumber}`);
    if (!revision) {
      throw { id: 'notFound' };
    }

    const revisionRealDiff = {};
    Object.keys(revisionDiff || {}).forEach(key => {
      if (!_.isEqual(revision[key], revisionDiff[key])) {
        revisionRealDiff[key] = revisionDiff[key];
      }
    });

    if (Object.keys(revisionRealDiff).length > 0) {
      await workflowManager.updateAtmLambdaRevision(
        get(atmLambda, 'entityId'),
        revisionNumber,
        revisionRealDiff
      );
    }
  },
});
