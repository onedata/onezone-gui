/**
 * Creates new automation inventory.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['content-atm-inventories-new'],

  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentAtmInventoriesNew',

  /**
   * @type {string}
   */
  atmInventoryName: undefined,

  didInsertElement() {
    this._super(...arguments);
    this.get('element').querySelector('#new-atm-inventory-name').focus();
  },

  actions: {
    createAtmInventory() {
      const {
        atmInventoryName,
        workflowActions,
      } = this.getProperties('atmInventoryName', 'workflowActions');

      return workflowActions.createCreateAtmInventoryAction({
        rawAtmInventory: {
          name: atmInventoryName,
        },
      }).execute();
    },
  },
});
