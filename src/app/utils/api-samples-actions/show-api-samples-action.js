/**
 * Open modal with api samples for passed record
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.apiSamplesActions.showApiSamplesAction',

  /**
   * @override
   */
  className: 'show-api-samples-action-trigger',

  /**
   * @override
   */
  icon: 'rest',

  /**
   * @type {ComputedProperty<Object>}
   */
  record: reads('context.record'),

  /**
   * @type {ComputedProperty<String>}
   */
  apiSubject: reads('context.apiSubject'),

  /**
   * @override
   */
  async onExecute() {
    return await this.modalManager.show('api-samples-modal', {
      record: this.record,
      apiSubject: this.apiSubject,
    }).hiddenPromise;
  },
});
