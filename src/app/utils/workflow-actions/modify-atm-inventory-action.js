/**
 * Modifies existing automation inventory. Needs `atmInventory` (model) and
 * `atmInventoryDiff` (changed fields) passed in context.
 *
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
  i18nPrefix: 'utils.workflowActions.modifyAtmInventoryAction',

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('context.atmInventory'),

  /**
   * @type {ComputedProperty<Object>}
   */
  atmInventoryDiff: reads('context.atmInventoryDiff'),

  /**
   * @override
   */
  onExecute() {
    const {
      atmInventory,
      atmInventoryDiff,
    } = this.getProperties(
      'atmInventory',
      'atmInventoryDiff',
    );

    const result = ActionResult.create();
    let promise;
    if (Object.keys(atmInventoryDiff).length > 0) {
      setProperties(atmInventory, atmInventoryDiff);
      promise = result.interceptPromise(
        atmInventory.save().then(() => atmInventory)
      ).catch(() => {
        atmInventory.rollbackAttributes();
      });
    } else {
      promise = result.interceptPromise(resolve(atmInventory));
    }

    return promise.then(() => result);
  },
});
