/**
 * Creates new automation inventory.
 *
 * @module components/content-inventories-new
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';

export default Component.extend(I18n, {
  classNames: ['content-inventories-new'],

  workflowActions: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.contentInventoriesNew',

  /**
   * @type {string}
   */
  atmInventoryName: undefined,

  didInsertElement() {
    this._super(...arguments);
    this.$('#new-atm-inventory-name').focus();
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
