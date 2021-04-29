/**
 * Redirects to automation inventory creation page on execute.
 *
 * @module utils/workflow-actions/open-create-atm-inventory-view-action
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
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
  i18nPrefix: 'utils.workflowActions.openCreateAtmInventoryViewAction',

  /**
   * @override
   */
  icon: 'add-filled',

  /**
   * @override
   */
  tip: computedT('tip'),

  /**
   * @override
   */
  className: 'create-atm-inventory-link-trigger',

  /**
   * @override
   */
  execute() {
    const result = ActionResult.create();
    return result.interceptPromise(
      this.get('router').transitionTo('onedata.sidebar.content', 'atm-inventories', 'new')
    ).then(() => result, () => result);
  },
});
