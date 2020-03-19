/**
 * Redirects to token consumer page on execute.
 *
 * @module utils/token-actions/open-consume-token-view-action
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { inject as service } from '@ember/service';
import computedT from 'onedata-gui-common/utils/computed-t';
import Action from 'onedata-gui-common/utils/action';
import ActionResult from 'onedata-gui-common/utils/action-result';

export default Action.extend({
  router: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.tokenActions.openConsumeTokenViewAction',

  /**
   * @override
   */
  title: computedT('title'),

  /**
   * @override
   */
  icon: 'add-filled',

  /**
   * @override
   */
  tip: computedT('tip'),

  /**
   * @type {ComputedProperty<String>}
   */
  sidebarTitle: computedT('sidebarTitle'),

  /**
   * @override
   */
  className: 'consume-token-link-trigger',

  /**
   * @override
   */
  execute() {
    if (!this.get('disabled')) {
      const result = ActionResult.create();
      return result.interceptPromise(
        this.get('router').transitionTo('onedata.sidebar.content', 'tokens', 'join')
      ).then(() => result, () => result);
    }
  },
});
