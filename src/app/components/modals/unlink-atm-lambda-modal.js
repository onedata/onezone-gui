/**
 * A modal that acknowledges unlinking lambda. Data needed from modalOptions:
 * - atmInventory - inventory, where the unlink operation should take place,
 * - atmLambda - lambda to unlink.
 *
 * @author Michał Borzęcki
 * @copyright (C) 2021 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import I18n from 'onedata-gui-common/mixins/i18n';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.unlinkAtmLambdaModal',

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  /**
   * @virtual
   * @type {Object}
   */
  modalOptions: undefined,

  /**
   * @type {String}
   */
  selectedRadioValue: 'thisInventory',

  /**
   * @type {ComputedProperty<Models.AtmInventory>}
   */
  atmInventory: reads('modalOptions.atmInventory'),

  /**
   * @type {ComputedProperty<Models.AtmLambda>}
   */
  atmLambda: reads('modalOptions.atmLambda'),

  /**
   * @type {ComputedProperty<Array<FieldOption>>}
   */
  radioOptions: computed('atmInventory.name', function options() {
    return [{
      value: 'thisInventory',
      label: this.t('radioOptions.thisInventory', {
        atmInventoryName: this.get('atmInventory.name'),
      }),
    }, {
      value: 'allInventories',
      label: this.t('radioOptions.allInventories'),
    }];
  }),

  actions: {
    radioValueChange(selectedValue) {
      this.set('selectedRadioValue', selectedValue);
    },
    async submit(submitCallback) {
      this.set('isSubmitting', true);
      const selectedRadioValue = this.get('selectedRadioValue');
      try {
        await submitCallback({ inventoriesToUnlink: selectedRadioValue });
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
