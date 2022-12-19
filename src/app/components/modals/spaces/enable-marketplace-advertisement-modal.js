/**
 * Confirmation of turning on space advertising in marketplace.
 * Includes submit action (standalone modal).
 *
 * @author Jakub Liput
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@ember/component';
import { computed, setProperties } from '@ember/object';
import { reads } from '@ember/object/computed';
import I18n from 'onedata-gui-common/mixins/components/i18n';
import { inject as service } from '@ember/service';
import safeExec from 'onedata-gui-common/utils/safe-method-execution';
import { or, not } from 'ember-awesome-macros';
import TextField from 'onedata-gui-common/utils/form-component/text-field';
import FormFieldsRootGroup from 'onedata-gui-common/utils/form-component/form-fields-root-group';
import { validator } from 'ember-cp-validations';

export default Component.extend(I18n, {
  tagName: '',

  i18n: service(),
  globalNotify: service(),

  /**
   * @override
   */
  i18nPrefix: 'components.modals.spaces.enableMarketplaceAdvertisementModal',

  /**
   * @virtual
   * @type {{ space: Models.Space }}
   */
  modalOptions: undefined,

  /**
   * @virtual
   * @type {String}
   */
  modalId: undefined,

  //#region state

  /**
   * @type {boolean}
   */
  isSubmitting: false,

  /**
   * @type {string}
   */
  contactEmail: '',

  //#endregion

  space: reads('modalOptions.space'),

  rootField: computed(function rootField() {
    return FormFieldsRootGroup.create({
      ownerSource: this,
      i18nPrefix: this.i18nPrefix,
      fields: [
        this.contactEmailField,
      ],
    });
  }),

  contactEmailField: computed(function contactEmailField() {
    return TextField.create({
      ownerSource: this,
      name: 'contactEmail',
      defaultValue: this.space.contactEmail || '',
      isOptional: false,
      customValidators: [
        validator('format', {
          type: 'email',
          allowBlank: false,
        }),
      ],
    });
  }),

  areButtonsDisabled: or('isSubmitting', not('contactEmailField.isValid')),

  // TODO: VFS-10252 this could be RPC in final implementation
  async enableMarketplaceAdvertisement() {
    setProperties(this.space, {
      advertisedInMarketplace: true,
      contactEmail: this.contactEmailField.value,
    });
    try {
      await this.space.save();
    } catch (error) {
      this.space.rollbackAttributes();
      await this.space.reload();
      throw error;
    }
  },

  actions: {
    async submit(submitCallback, result) {
      if (this.areButtonsDisabled) {
        return;
      }
      this.set('isSubmitting', true);
      try {
        await this.enableMarketplaceAdvertisement();
        await submitCallback(result);
      } catch (error) {
        this.globalNotify.backendError(this.t('enablingAdvertisement'), error);
      } finally {
        safeExec(this, () => this.set('isSubmitting', false));
      }
    },
  },
});
