/**
 * Modifies existing automation lambda. Needs `atmkambda` (model) and
 * `atmLambdaDiff` (changed fields) passed in context.
 *
 * @module utils/workflow-actions/modify-atm-lambda-action
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
  i18nPrefix: 'utils.workflowActions.modifyAtmLambdaAction',

  /**
   * @type {ComputedProperty<Models.AtmLambda>}
   */
  atmLambda: reads('context.atmLambda'),

  /**
   * @type {ComputedProperty<Object>}
   */
  atmLambdaDiff: reads('context.atmLambdaDiff'),

  /**
   * @override
   */
  onExecute() {
    const {
      atmLambda,
      atmLambdaDiff,
    } = this.getProperties(
      'atmLambda',
      'atmLambdaDiff',
    );

    const result = ActionResult.create();
    let promise;
    if (Object.keys(atmLambdaDiff).length > 0) {
      setProperties(atmLambda, atmLambdaDiff);
      promise = result.interceptPromise(
        atmLambda.save().then(() => atmLambda)
      ).catch(() => {
        atmLambda.rollbackAttributes();
      });
    } else {
      promise = result.interceptPromise(resolve(atmLambda));
    }

    return promise.then(() => result);
  },
});
