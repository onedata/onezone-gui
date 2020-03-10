/**
 * Modifies existing token. Needs `token` (model) and `tokenDiff` (changed fields) passed
 * in context.
 *
 * @module utils/token-actions/modify-token-action
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { setProperties } from '@ember/object';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

export default Action.extend({
  /**
   * @override
   */
  i18nPrefix: 'utils.tokenActions.modifyTokenAction',

  /**
   * @type {ComputedProperty<Models.Token>}
   */
  token: reads('context.token'),

  /**
   * @type {ComputedProperty<Object>}
   */
  tokenDiff: reads('context.tokenDiff'),

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const {
        token,
        tokenDiff,
      } = this.getProperties(
        'token',
        'tokenDiff',
      );

      const result = ActionResult.create();
      setProperties(token, tokenDiff);
      return result.interceptPromise(token.save().then(() => token))
        .catch(() => {
          token.rollbackAttributes();
        })
        .then(() => {
          this.notifyResult(result);
          return result;
        });
    }
  },
});
