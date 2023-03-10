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
  router: service(),

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

  isEmailShareConfirmed: false,

  //#endregion

  space: reads('modalOptions.space'),

  marketplaceHref: computed(function marketplaceHref() {
    return this.router.urlFor(
      'onedata.sidebar.content',
      'spaces',
      'join'
    );
  }),

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
      name: 'contactEmail',
      defaultValue: this.space.marketplaceContactEmail || '',
      customValidators: [
        validator('format', {
          type: 'email',
          allowBlank: false,
        }),
      ],
    });
  }),

  areButtonsDisabled: or(
    'isSubmitting',
    not('rootField.isValid'),
    not('isEmailShareConfirmed'),
  ),

  async enableMarketplaceAdvertisement() {
    setProperties(this.space, {
      advertisedInMarketplace: true,
      marketplaceContactEmail: this.contactEmailField.value,
    });
    try {
      await this.space.save();
    } catch (error) {
      this.space.rollbackAttributes();
      try {
        await this.space.reload();
      } catch (error) {
        console.error('reloading space after save error failed', error);
      }
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
    toggleEmailShareConfirmation(state = !this.isEmailShareConfirmed) {
      if (this.isDisabled) {
        return;
      }
      this.set('isEmailShareConfirmed', state);
    },
  },
});
