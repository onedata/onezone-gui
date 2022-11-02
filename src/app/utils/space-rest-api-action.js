/**
 * Open modal with rest api for space
 *
 * @author Agnieszka Warchoł
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Action from 'onedata-gui-common/utils/action';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Action.extend({
  modalManager: service(),

  /**
   * @override
   */
  i18nPrefix: 'utils.spaceRestApiAction',

  /**
   * @override
   */
  className: 'space-rest-api-action-trigger',

  /**
   * @override
   */
  icon: 'rest',

  /**
   * @type {ComputedProperty<String>}
   */
  title: computed(function title() {
    return this.t('title');
  }),

  /**
   * @type {ComputedProperty<String>}
   */
  spaceId: reads('context.spaceId'),

  /**
   * @override
   */
  async onExecute() {
    return await this.modalManager.show('space-rest-api-modal', {
      spaceId: this.spaceId,
    }).hiddenPromise;
  },
});
