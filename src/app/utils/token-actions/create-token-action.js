/**
 * Creates new token. Needs rawToken object passed in context - it will be used
 * to create new token record.
 *
 * @module utils/token-actions/create-token-action
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { reads } from '@ember/object/computed';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';
import { next } from '@ember/runloop';

export default Action.extend({
  tokenManager: service(),
  router: service(),
  guiUtils: service(),

  /**
   * @override
   */
  i18nPrefix: 'services.tokenActions.createTokenAction',

  /**
   * @type {ComputedProperty<Object>}
   */
  rawToken: reads('context.rawToken'),

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const {
        rawToken,
        tokenManager,
        router,
        guiUtils,
      } = this.getProperties(
        'rawToken',
        'tokenManager',
        'router',
        'guiUtils'
      );

      const result = ActionResult.create();
      return result.interceptPromise(tokenManager.createToken(rawToken))
        .catch(() => {})
        .then(() => {
          this.notifyResult(result);
          if (get(result, 'status') === 'done') {
            next(() => {
              router.transitionTo(
                'onedata.sidebar.content',
                'tokens',
                guiUtils.getRoutableIdFor(get(result, 'result'))
              );
            });
          }
          return result;
        });
    }
  },
});
