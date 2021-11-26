/**
 * Allows to choose dump application target automation inventory.
 *
 * @module components/modals/apply-atm-workflow-schema-dump/inventory-selector
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import DropdownField from 'onedata-gui-common/utils/form-component/dropdown-field';
import { computed, get } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import { tag, not } from 'ember-awesome-macros';

export default Component.extend(I18n, {
  classNames: ['inventory-selector'],

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.applyAtmWorkflowSchemaDumpModal.inventorySelector',

  /**
   * @virtual
   * @type {Models.AtmInventory}
   */
  selectedAtmInventory: undefined,

  /**
   * @virtual
   * @type {Array<Models.AtmInventory>}
   */
  atmInventories: undefined,

  /**
   * @virtual
   * @type {(atmInventory: Models.AtmInventory) => void}
   */
  onChange: undefined,

  /**
   * @virtual
   * @type {Boolean}
   */
  isDisabled: false,

  /**
   * @type {ComputedProperty<Utils.FormComponent.DropdownField>}
   */
  targetAtmInventoryField: computed(function targetAtmInventoryField() {
    return DropdownField.extend({
      i18nPrefix: tag `${'component.i18nPrefix'}.fields`,
      options: computed('component.atmInventories', function options() {
        const atmInventories = this.get('component.atmInventories') || [];
        return atmInventories.sortBy('name').map(atmInventory => ({
          label: get(atmInventory, 'name'),
          value: atmInventory,
        }));
      }),
      onValueChange(atmInventory) {
        this.get('component').notifyChange(atmInventory);
        this.markAsModified();
      },
      valuesSource: reads('component.selectedAtmInventory'),
      isEnabled: not('component.isDisabled'),
    }).create({
      ownerSource: this,
      component: this,
      name: 'targetAtmInventory',
      valueName: null,
    });
  }),

  notifyChange(atmInventory) {
    const onChange = this.get('onChange');
    onChange && onChange(atmInventory);
  },
});
